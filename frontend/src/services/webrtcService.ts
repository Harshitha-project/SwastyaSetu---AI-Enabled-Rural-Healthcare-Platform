// WebRTC service using BroadcastChannel for same-browser tab signaling.
// Socket.IO is attempted but never blocks peer discovery.

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderRole: 'PATIENT' | 'DOCTOR'
  text: string
  timestamp: string
}

export interface Participant {
  odId: string
  odName: string
  role: 'PATIENT' | 'DOCTOR'
}

export interface WebRTCCallbacks {
  onLocalStream?: (stream: MediaStream) => void
  onRemoteStream?: (stream: MediaStream) => void
  onPeerJoined?: (participant: Participant) => void
  onPeerLeft?: (participant: Participant) => void
  onChatMessage?: (message: ChatMessage) => void
  onCallEnded?: () => void
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void
  onError?: (error: Error) => void
  onRoomFull?: () => void
  onPeerMediaToggle?: (data: { odId: string; type: 'audio' | 'video'; enabled: boolean }) => void
}

export class WebRTCService {
  private channel: BroadcastChannel | null = null
  private pc: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private roomId = ''
  private userName = ''
  private role: 'PATIENT' | 'DOCTOR' = 'PATIENT'
  private callbacks: WebRTCCallbacks = {}
  private pendingCandidates: RTCIceCandidateInit[] = []
  private makingOffer = false
  private impolite = false
  private peerFound = false
  private pingTimer: any = null
  private syntheticTimer: any = null
  // Unique stable ID per instance
  readonly id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  // ── Public API ────────────────────────────────────────────────────────────

  setCallbacks(cb: WebRTCCallbacks) {
    this.callbacks = { ...this.callbacks, ...cb }
  }

  // connect() is a no-op now — kept for API compatibility
  async connect(): Promise<void> {}

  async getUserMedia(userName?: string, role?: 'PATIENT' | 'DOCTOR'): Promise<MediaStream> {
    if (userName) this.userName = userName
    if (role) this.role = role
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      })
      console.log('[RTC] Real camera acquired')
    } catch {
      console.warn('[RTC] Camera denied, using synthetic stream')
      this.localStream = this.makeSyntheticStream()
    }
    this.callbacks.onLocalStream?.(this.localStream)
    return this.localStream
  }

  async joinRoom(roomId: string, userName: string, role: 'PATIENT' | 'DOCTOR'): Promise<void> {
    this.roomId = roomId
    this.userName = userName
    this.role = role

    // Open channel AFTER roomId is set
    this.channel = new BroadcastChannel(`swasthyasetu_rtc_${roomId}`)
    this.channel.onmessage = (e) => this.onMessage(e.data)
    console.log(`[RTC:${this.id.slice(-4)}] Joined room ${roomId} as ${role}`)

    this.buildPeerConnection()
    this.startPinging()
  }

  sendChatMessage(text: string, senderId: string, senderName: string, senderRole: 'PATIENT' | 'DOCTOR') {
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      roomId: this.roomId, senderId, senderName, senderRole, text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    this.callbacks.onChatMessage?.(msg)
    this.send({ type: 'CHAT', msg })
  }

  toggleAudio(enabled: boolean) {
    this.localStream?.getAudioTracks().forEach(t => { t.enabled = enabled })
    this.send({ type: 'MEDIA', kind: 'audio', enabled })
  }

  toggleVideo(enabled: boolean) {
    this.localStream?.getVideoTracks().forEach(t => { t.enabled = enabled })
    this.send({ type: 'MEDIA', kind: 'video', enabled })
  }

  endCall() {
    this.send({ type: 'BYE' })
    this.destroy()
  }

  leaveRoom() { this.destroy() }
  disconnect() { this.destroy() }

  getCurrentUserInfo() {
    return { id: this.id, name: this.userName, role: this.role }
  }

  getLocalStream() { return this.localStream }
  getRemoteStream() { return this.remoteStream }
  isSocketConnected() { return false }
  getCurrentRoomId() { return this.roomId }

  // ── Internal ──────────────────────────────────────────────────────────────

  private send(data: object) {
    this.channel?.postMessage({ ...data, from: this.id })
  }

  private startPinging() {
    this.stopPinging()
    let n = 0
    const ping = () => {
      if (this.peerFound || !this.roomId || n++ > 150) { this.stopPinging(); return }
      this.send({ type: 'PING', name: this.userName, role: this.role })
    }
    ping()
    this.pingTimer = setInterval(ping, 600)
  }

  private stopPinging() {
    clearInterval(this.pingTimer)
    this.pingTimer = null
  }

  private async onMessage(data: any) {
    if (!data || data.from === this.id) return

    switch (data.type) {
      case 'PING': {
        // Always reply with PONG so the pinger knows we're here
        this.send({ type: 'PONG', name: this.userName, role: this.role })
        if (!this.peerFound) {
          this.peerFound = true
          this.stopPinging()
          this.callbacks.onPeerJoined?.({ odId: data.from, odName: data.name, role: data.role })
          // Higher ID = impolite = creates offer
          this.impolite = this.id > data.from
          console.log(`[RTC:${this.id.slice(-4)}] PING from ${data.from.slice(-4)}, impolite=${this.impolite}`)
          if (this.impolite) await this.createOffer()
        }
        break
      }
      case 'PONG': {
        if (!this.peerFound) {
          this.peerFound = true
          this.stopPinging()
          this.callbacks.onPeerJoined?.({ odId: data.from, odName: data.name, role: data.role })
          this.impolite = this.id > data.from
          console.log(`[RTC:${this.id.slice(-4)}] PONG from ${data.from.slice(-4)}, impolite=${this.impolite}`)
          if (this.impolite) await this.createOffer()
        }
        break
      }
      case 'OFFER':
        await this.handleOffer(data.offer)
        break
      case 'ANSWER':
        await this.handleAnswer(data.answer)
        break
      case 'ICE':
        await this.handleIce(data.candidate)
        break
      case 'CHAT':
        this.callbacks.onChatMessage?.(data.msg)
        break
      case 'MEDIA':
        this.callbacks.onPeerMediaToggle?.({ odId: data.from, type: data.kind, enabled: data.enabled })
        break
      case 'BYE':
        this.callbacks.onCallEnded?.()
        this.destroyPeerConnection()
        break
    }
  }

  private buildPeerConnection() {
    if (this.pc) return
    console.log(`[RTC:${this.id.slice(-4)}] Building RTCPeerConnection`)
    this.pc = new RTCPeerConnection(ICE_SERVERS)

    // Add local tracks
    this.localStream?.getTracks().forEach(t => {
      this.pc!.addTrack(t, this.localStream!)
      console.log(`[RTC:${this.id.slice(-4)}] Added local track: ${t.kind}`)
    })

    this.pc.ontrack = (e) => {
      console.log(`[RTC:${this.id.slice(-4)}] ontrack: ${e.track.kind}`)
      const stream = e.streams[0] ?? (() => {
        if (!this.remoteStream) this.remoteStream = new MediaStream()
        this.remoteStream.addTrack(e.track)
        return this.remoteStream
      })()
      this.remoteStream = stream
      this.callbacks.onRemoteStream?.(stream)
    }

    this.pc.onicecandidate = (e) => {
      if (e.candidate) this.send({ type: 'ICE', candidate: e.candidate.toJSON() })
    }

    this.pc.onconnectionstatechange = () => {
      const s = this.pc?.connectionState
      console.log(`[RTC:${this.id.slice(-4)}] Connection: ${s}`)
      if (s) this.callbacks.onConnectionStateChange?.(s)
    }

    this.pc.onnegotiationneeded = () => {} // manual negotiation only
  }

  private async createOffer() {
    if (this.makingOffer || !this.pc) return
    this.makingOffer = true
    try {
      console.log(`[RTC:${this.id.slice(-4)}] Creating offer`)
      const offer = await this.pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
      await this.pc.setLocalDescription(offer)
      this.send({ type: 'OFFER', offer: this.pc.localDescription!.toJSON() })
      console.log(`[RTC:${this.id.slice(-4)}] Offer sent`)
    } catch (e) {
      console.error('[RTC] createOffer error:', e)
    } finally {
      this.makingOffer = false
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.pc) this.buildPeerConnection()
    const pc = this.pc!
    try {
      if (this.makingOffer || pc.signalingState !== 'stable') {
        if (this.impolite) {
          console.warn(`[RTC:${this.id.slice(-4)}] Glare: impolite, ignoring offer`)
          return
        }
        console.warn(`[RTC:${this.id.slice(-4)}] Glare: polite, rolling back`)
        await pc.setLocalDescription({ type: 'rollback' })
        this.makingOffer = false
      }
      await pc.setRemoteDescription(offer)
      // Flush queued candidates
      for (const c of this.pendingCandidates) await pc.addIceCandidate(c).catch(() => {})
      this.pendingCandidates = []
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      this.send({ type: 'ANSWER', answer: pc.localDescription!.toJSON() })
      console.log(`[RTC:${this.id.slice(-4)}] Answer sent`)
    } catch (e) {
      console.error('[RTC] handleOffer error:', e)
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (this.pc?.signalingState === 'have-local-offer') {
      try {
        await this.pc.setRemoteDescription(answer)
        for (const c of this.pendingCandidates) await this.pc.addIceCandidate(c).catch(() => {})
        this.pendingCandidates = []
        console.log(`[RTC:${this.id.slice(-4)}] Answer applied`)
      } catch (e) {
        console.error('[RTC] handleAnswer error:', e)
      }
    }
  }

  private async handleIce(candidate: RTCIceCandidateInit) {
    if (this.pc?.remoteDescription?.type) {
      await this.pc.addIceCandidate(candidate).catch(() => {})
    } else {
      this.pendingCandidates.push(candidate)
    }
  }

  private makeSyntheticStream(): MediaStream {
    const canvas = document.createElement('canvas')
    canvas.width = 640; canvas.height = 480
    const ctx = canvas.getContext('2d')!
    const isDoc = this.role === 'DOCTOR'
    let f = 0
    const draw = () => {
      f++
      const g = ctx.createLinearGradient(0, 0, 640, 480)
      g.addColorStop(0, isDoc ? '#042f2e' : '#082f49')
      g.addColorStop(1, isDoc ? '#0f766e' : '#0369a1')
      ctx.fillStyle = g; ctx.fillRect(0, 0, 640, 480)
      const p = Math.sin(f * 0.08) * 8
      ctx.beginPath(); ctx.arc(320, 200, 60 + p, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill()
      ctx.font = '48px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(isDoc ? '👨‍⚕️' : '👤', 320, 200)
      ctx.fillStyle = '#fff'; ctx.font = 'bold 20px sans-serif'
      ctx.fillText(this.userName || (isDoc ? 'Doctor' : 'Patient'), 320, 290)
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 450, 640, 30)
      ctx.fillStyle = '#10b981'; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText(`● LIVE  ${new Date().toLocaleTimeString()}`, 10, 470)
    }
    if (this.syntheticTimer) clearInterval(this.syntheticTimer)
    this.syntheticTimer = setInterval(draw, 33)
    draw()
    return canvas.captureStream(30)
  }

  private destroyPeerConnection() {
    if (this.pc) {
      this.pc.ontrack = null
      this.pc.onicecandidate = null
      this.pc.onconnectionstatechange = null
      this.pc.onnegotiationneeded = null
      this.pc.close()
      this.pc = null
    }
    this.remoteStream = null
    this.pendingCandidates = []
    this.makingOffer = false
  }

  private destroy() {
    this.stopPinging()
    this.destroyPeerConnection()
    if (this.syntheticTimer) { clearInterval(this.syntheticTimer); this.syntheticTimer = null }
    this.localStream?.getTracks().forEach(t => t.stop())
    this.localStream = null
    this.channel?.close(); this.channel = null
    this.roomId = ''
    this.peerFound = false
    this.impolite = false
  }
}

// Legacy singleton export
export const webrtcService = new WebRTCService()
