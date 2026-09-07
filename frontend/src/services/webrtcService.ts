import { io, Socket } from 'socket.io-client'

const SIGNALING_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// ICE Servers configuration (STUN/TURN)
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
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

class WebRTCService {
  private socket: Socket | null = null
  private channel: BroadcastChannel | null = null
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private currentRoomId: string | null = null
  private callbacks: WebRTCCallbacks = {}
  private pendingCandidates: RTCIceCandidateInit[] = []
  private makingOffer: boolean = false
  private ignoreOffer: boolean = false
  private isPolite: boolean = false
  private currentUserId: string = ''
  private currentUserName: string = ''
  private currentRole: 'PATIENT' | 'DOCTOR' = 'PATIENT'
  private clientId: string = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  private syntheticInterval: any = null

  constructor() {
    this.initBroadcastChannel()
  }

  private initBroadcastChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.channel = new BroadcastChannel('swasthyasetu_webrtc_signaling_bus')
        this.channel.onmessage = async (event) => {
          const data = event.data
          if (!data || data.senderClientId === this.clientId) return
          if (data.roomId && this.currentRoomId && data.roomId !== this.currentRoomId) return

          switch (data.type) {
            case 'PEER_ANNOUNCE': {
              console.log('[WebRTC:Bus] Peer announced presence:', data.participant)
              this.callbacks.onPeerJoined?.(data.participant)
              // Reply with our presence so the new peer knows we are here
              this.channel?.postMessage({
                type: 'PEER_ACK',
                roomId: this.currentRoomId,
                senderClientId: this.clientId,
                participant: {
                  odId: this.clientId,
                  odName: this.currentUserName,
                  role: this.currentRole,
                },
              })
              break
            }
            case 'PEER_ACK': {
              console.log('[WebRTC:Bus] Peer acknowledged presence:', data.participant)
              this.callbacks.onPeerJoined?.(data.participant)
              // Second joiner acts as initiator and creates offer
              setTimeout(() => this.createOffer(), 300)
              break
            }
            case 'OFFER': {
              console.log('[WebRTC:Bus] Received offer from bus')
              await this.handleOffer(data.offer)
              break
            }
            case 'ANSWER': {
              console.log('[WebRTC:Bus] Received answer from bus')
              await this.handleAnswer(data.answer)
              break
            }
            case 'ICE_CANDIDATE': {
              console.log('[WebRTC:Bus] Received ICE candidate from bus')
              await this.handleIceCandidate(data.candidate)
              break
            }
            case 'CHAT_MESSAGE': {
              console.log('[WebRTC:Bus] Received chat message from bus:', data.message)
              this.callbacks.onChatMessage?.(data.message)
              break
            }
            case 'MEDIA_TOGGLE': {
              this.callbacks.onPeerMediaToggle?.(data.mediaToggle)
              break
            }
            case 'END_CALL': {
              this.callbacks.onCallEnded?.()
              this.cleanupPeerConnection()
              break
            }
          }
        }
      }
    } catch (e) {
      console.warn('[WebRTC] BroadcastChannel not supported in this context', e)
    }
  }

  // Initialize socket connection with non-blocking fallback
  connect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      console.log('[WebRTC] Connecting to signaling server:', SIGNALING_SERVER_URL)
      
      try {
        this.socket = io(SIGNALING_SERVER_URL, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 4000,
        })

        const fallbackTimer = setTimeout(() => {
          console.warn('[WebRTC] Signaling server connection timed out; using local peer bus.')
          resolve()
        }, 3500)

        this.socket.on('connect', () => {
          clearTimeout(fallbackTimer)
          console.log('[WebRTC] Connected to signaling server, socket id:', this.socket?.id)
          resolve()
        })

        this.socket.on('connect_error', (error) => {
          clearTimeout(fallbackTimer)
          console.warn('[WebRTC] Signaling server unavailable, using local peer bus fallback:', error.message)
          resolve()
        })

        this.setupSocketListeners()
      } catch (err) {
        console.warn('[WebRTC] Error initializing socket, proceeding with bus fallback:', err)
        resolve()
      }
    })
  }

  private setupSocketListeners() {
    if (!this.socket) return

    this.socket.on('room-joined', async (data: { roomId: string; participants: Participant[]; isInitiator: boolean }) => {
      console.log('[WebRTC] Room joined via socket:', data)
      this.isPolite = data.participants.length === 0
      
      if (data.participants.length > 0) {
        data.participants.forEach(p => this.callbacks.onPeerJoined?.(p))
        setTimeout(() => this.createOffer(), 400)
      }
    })

    this.socket.on('room-full', () => {
      this.callbacks.onRoomFull?.()
    })

    this.socket.on('peer-joined', (participant: Participant) => {
      console.log('[WebRTC] Peer joined via socket:', participant)
      this.callbacks.onPeerJoined?.(participant)
    })

    this.socket.on('peer-left', (participant: Participant) => {
      console.log('[WebRTC] Peer left via socket:', participant)
      this.callbacks.onPeerLeft?.(participant)
      this.cleanupPeerConnection()
    })

    this.socket.on('offer', async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
      console.log('[WebRTC] Received offer via socket from:', data.from)
      await this.handleOffer(data.offer)
    })

    this.socket.on('answer', async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
      console.log('[WebRTC] Received answer via socket from:', data.from)
      await this.handleAnswer(data.answer)
    })

    this.socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit; from: string }) => {
      await this.handleIceCandidate(data.candidate)
    })

    this.socket.on('chat-message', (message: ChatMessage) => {
      this.callbacks.onChatMessage?.(message)
    })

    this.socket.on('call-ended', () => {
      this.callbacks.onCallEnded?.()
      this.cleanup()
    })

    this.socket.on('peer-media-toggle', (data: { odId: string; type: 'audio' | 'video'; enabled: boolean }) => {
      this.callbacks.onPeerMediaToggle?.(data)
    })
  }

  // Generate an animated synthetic video/audio stream for testing or when physical camera is unavailable
  private createSyntheticStream(role: 'PATIENT' | 'DOCTOR', name: string): MediaStream {
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 480
    const ctx = canvas.getContext('2d')
    let frame = 0

    const isDoc = role === 'DOCTOR'

    const draw = () => {
      if (!ctx) return
      frame++
      
      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      if (isDoc) {
        grad.addColorStop(0, '#042f2e')
        grad.addColorStop(1, '#0f766e')
      } else {
        grad.addColorStop(0, '#082f49')
        grad.addColorStop(1, '#0369a1')
      }
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Animated pulsing concentric circles
      const pulse = Math.sin(frame * 0.08) * 8
      ctx.beginPath()
      ctx.arc(320, 200, 68 + pulse, 0, Math.PI * 2)
      ctx.fillStyle = isDoc ? 'rgba(20, 184, 166, 0.25)' : 'rgba(14, 165, 233, 0.25)'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(320, 200, 56, 0, Math.PI * 2)
      ctx.fillStyle = isDoc ? '#0d9488' : '#0284c7'
      ctx.fill()

      // Avatar Icon
      ctx.font = '50px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(isDoc ? '👨‍⚕️' : '👤', 320, 200)

      // User Label
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 22px Inter, system-ui, sans-serif'
      ctx.fillText(name || (isDoc ? 'Dr. Priya Sharma' : 'Patient Ramesh Patil'), 320, 290)

      // Subtitle
      ctx.fillStyle = isDoc ? '#99f6e4' : '#bae6fd'
      ctx.font = '13px Inter, system-ui, sans-serif'
      ctx.fillText(
        isDoc ? 'Live Telemedicine Doctor Feed' : 'Patient Teleconsultation Feed',
        320,
        318
      )

      // Live HD Stream Pill
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
      ctx.beginPath()
      ctx.roundRect ? ctx.roundRect(220, 350, 200, 32, 16) : ctx.rect(220, 350, 200, 32)
      ctx.fill()

      ctx.fillStyle = '#10b981'
      ctx.beginPath()
      ctx.arc(245, 366, 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 11px Inter, system-ui, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('WEBRTC HD STREAM', 260, 370)
    }

    if (this.syntheticInterval) clearInterval(this.syntheticInterval)
    this.syntheticInterval = setInterval(draw, 1000 / 30)
    draw()

    const stream = canvas.captureStream(30)

    // Add silent audio track via Web Audio API
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        const audioCtx = new AudioCtx()
        const osc = audioCtx.createOscillator()
        const dst = audioCtx.createMediaStreamDestination()
        const gain = audioCtx.createGain()
        gain.gain.value = 0
        osc.connect(gain)
        gain.connect(dst)
        osc.start()
        dst.stream.getAudioTracks().forEach(track => stream.addTrack(track))
      }
    } catch {}

    return stream
  }

  // Get user media with fallback to synthetic stream if hardware camera is not available
  async getUserMedia(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    const defaultConstraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        facingMode: 'user',
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log('[WebRTC] Requesting physical user media...')
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints || defaultConstraints)
        console.log('[WebRTC] Acquired physical camera stream with tracks:', this.localStream.getTracks().length)
        this.callbacks.onLocalStream?.(this.localStream)
        return this.localStream
      }
    } catch (hardwareErr: any) {
      console.warn('[WebRTC] Physical media unavailable or permission denied; switching to clinical synthetic video feed:', hardwareErr?.message || hardwareErr)
    }

    // Fallback to high-quality synthetic stream
    this.localStream = this.createSyntheticStream(this.currentRole, this.currentUserName)
    this.callbacks.onLocalStream?.(this.localStream)
    return this.localStream
  }

  // Join consultation room
  async joinRoom(roomId: string, userName: string, role: 'PATIENT' | 'DOCTOR'): Promise<void> {
    await this.connect()

    this.currentRoomId = roomId
    this.currentUserName = userName
    this.currentRole = role
    this.currentUserId = `${role.toLowerCase()}-${Date.now()}`

    // Create RTCPeerConnection
    this.createPeerConnection()

    // 1. Emit to Socket.IO if connected
    if (this.socket?.connected) {
      this.socket.emit('join-room', { roomId, odName: userName, role })
      console.log(`[WebRTC:Socket] Emitted join-room: ${roomId} as ${userName} (${role})`)
    }

    // 2. Broadcast presence over peer channel
    if (this.channel) {
      this.channel.postMessage({
        type: 'PEER_ANNOUNCE',
        roomId,
        senderClientId: this.clientId,
        participant: {
          odId: this.clientId,
          odName: userName,
          role,
        },
      })
      console.log(`[WebRTC:Bus] Broadcasted presence for room ${roomId}`)
    }
  }

  // Create peer connection
  private createPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) {
      return this.peerConnection
    }

    console.log('[WebRTC] Creating RTCPeerConnection...')
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS)

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        console.log(`[WebRTC] Adding local track to peer connection: ${track.kind}`)
        this.peerConnection!.addTrack(track, this.localStream!)
      })
    }

    // Handle incoming tracks
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Received remote track:', event.track.kind, 'streams:', event.streams.length)
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0]
      } else {
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream()
        }
        this.remoteStream.addTrack(event.track)
      }
      this.callbacks.onRemoteStream?.(this.remoteStream)
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.currentRoomId) {
        const candidatePayload = event.candidate.toJSON()
        // Send to socket
        if (this.socket?.connected) {
          this.socket.emit('ice-candidate', {
            roomId: this.currentRoomId,
            candidate: candidatePayload,
          })
        }
        // Send to bus
        this.channel?.postMessage({
          type: 'ICE_CANDIDATE',
          roomId: this.currentRoomId,
          senderClientId: this.clientId,
          candidate: candidatePayload,
        })
      }
    }

    // Connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState
      console.log('[WebRTC] Connection state change:', state)
      if (state) {
        this.callbacks.onConnectionStateChange?.(state)
      }
    }

    return this.peerConnection
  }

  // Create and send offer
  private async createOffer(): Promise<void> {
    try {
      if (!this.peerConnection) {
        this.createPeerConnection()
      }

      this.makingOffer = true
      console.log('[WebRTC] Creating SDP offer...')

      const offer = await this.peerConnection!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      await this.peerConnection!.setLocalDescription(offer)

      const offerPayload = this.peerConnection!.localDescription?.toJSON()

      if (this.socket?.connected) {
        this.socket.emit('offer', {
          roomId: this.currentRoomId,
          offer: offerPayload,
        })
      }

      this.channel?.postMessage({
        type: 'OFFER',
        roomId: this.currentRoomId,
        senderClientId: this.clientId,
        offer: offerPayload,
      })
      console.log('[WebRTC] SDP offer sent')
    } catch (error) {
      console.error('[WebRTC] Error creating offer:', error)
      this.callbacks.onError?.(error as Error)
    } finally {
      this.makingOffer = false
    }
  }

  // Handle incoming offer
  private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (!this.peerConnection) {
        this.createPeerConnection()
      }

      if (this.peerConnection!.signalingState !== 'stable') {
        console.warn('[WebRTC] PeerConnection not stable, attempting to resolve offer')
        await Promise.all([
          this.peerConnection!.setLocalDescription({ type: 'rollback' }),
          this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer)),
        ])
      } else {
        await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer))
      }

      for (const candidate of this.pendingCandidates) {
        await this.peerConnection!.addIceCandidate(new RTCIceCandidate(candidate))
      }
      this.pendingCandidates = []

      const answer = await this.peerConnection!.createAnswer()
      await this.peerConnection!.setLocalDescription(answer)

      const answerPayload = this.peerConnection!.localDescription?.toJSON()

      if (this.socket?.connected) {
        this.socket.emit('answer', {
          roomId: this.currentRoomId,
          answer: answerPayload,
        })
      }

      this.channel?.postMessage({
        type: 'ANSWER',
        roomId: this.currentRoomId,
        senderClientId: this.clientId,
        answer: answerPayload,
      })
      console.log('[WebRTC] Answer generated and transmitted')
    } catch (error) {
      console.error('[WebRTC] Error handling offer:', error)
      this.callbacks.onError?.(error as Error)
    }
  }

  // Handle incoming answer
  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (this.peerConnection && this.peerConnection.signalingState === 'have-local-offer') {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        for (const candidate of this.pendingCandidates) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        }
        this.pendingCandidates = []
        console.log('[WebRTC] Remote answer processed successfully')
      }
    } catch (error) {
      console.error('[WebRTC] Error handling answer:', error)
      this.callbacks.onError?.(error as Error)
    }
  }

  // Handle incoming ICE candidate
  private async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      if (this.peerConnection?.remoteDescription && this.peerConnection.remoteDescription.type) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      } else {
        this.pendingCandidates.push(candidate)
      }
    } catch (error) {
      console.error('[WebRTC] Error adding candidate:', error)
    }
  }

  // Send chat message
  sendChatMessage(text: string, senderId: string, senderName: string, senderRole: 'PATIENT' | 'DOCTOR'): void {
    if (!this.currentRoomId) {
      console.warn('[WebRTC] Cannot send message: not in active room')
      return
    }

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      roomId: this.currentRoomId,
      senderId,
      senderName,
      senderRole,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    // Deliver immediately to local UI
    this.callbacks.onChatMessage?.(message)

    // Emit via socket if connected
    if (this.socket?.connected) {
      this.socket.emit('chat-message', {
        roomId: this.currentRoomId,
        message,
      })
    }

    // Broadcast across browser windows/tabs
    this.channel?.postMessage({
      type: 'CHAT_MESSAGE',
      roomId: this.currentRoomId,
      senderClientId: this.clientId,
      message,
    })
  }

  // Toggle audio
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled
      })
      const mediaToggle = { odId: this.clientId, type: 'audio' as const, enabled }
      if (this.socket?.connected && this.currentRoomId) {
        this.socket.emit('media-toggle', { roomId: this.currentRoomId, ...mediaToggle })
      }
      this.channel?.postMessage({
        type: 'MEDIA_TOGGLE',
        roomId: this.currentRoomId,
        senderClientId: this.clientId,
        mediaToggle,
      })
    }
  }

  // Toggle video
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled
      })
      const mediaToggle = { odId: this.clientId, type: 'video' as const, enabled }
      if (this.socket?.connected && this.currentRoomId) {
        this.socket.emit('media-toggle', { roomId: this.currentRoomId, ...mediaToggle })
      }
      this.channel?.postMessage({
        type: 'MEDIA_TOGGLE',
        roomId: this.currentRoomId,
        senderClientId: this.clientId,
        mediaToggle,
      })
    }
  }

  // End call
  endCall(): void {
    if (this.currentRoomId) {
      if (this.socket?.connected) {
        this.socket.emit('end-call', this.currentRoomId)
      }
      this.channel?.postMessage({
        type: 'END_CALL',
        roomId: this.currentRoomId,
        senderClientId: this.clientId,
      })
    }
    this.cleanup()
  }

  // Leave room without ending for others
  leaveRoom(): void {
    if (this.currentRoomId && this.socket?.connected) {
      this.socket.emit('leave-room', this.currentRoomId)
    }
    this.cleanup()
  }

  setCallbacks(callbacks: WebRTCCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  private cleanupPeerConnection(): void {
    if (this.peerConnection) {
      this.peerConnection.ontrack = null
      this.peerConnection.onicecandidate = null
      this.peerConnection.onconnectionstatechange = null
      this.peerConnection.close()
      this.peerConnection = null
    }
    this.remoteStream = null
    this.pendingCandidates = []
    this.makingOffer = false
    this.ignoreOffer = false
  }

  cleanup(): void {
    this.cleanupPeerConnection()

    if (this.syntheticInterval) {
      clearInterval(this.syntheticInterval)
      this.syntheticInterval = null
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.localStream = null
    }

    this.currentRoomId = null
  }

  disconnect(): void {
    this.cleanup()
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    if (this.channel) {
      this.channel.close()
      this.channel = null
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }

  isSocketConnected(): boolean {
    return this.socket?.connected ?? false
  }

  getCurrentRoomId(): string | null {
    return this.currentRoomId
  }

  getCurrentUserInfo() {
    return {
      id: this.currentUserId,
      name: this.currentUserName,
      role: this.currentRole,
    }
  }
}

export const webrtcService = new WebRTCService()
