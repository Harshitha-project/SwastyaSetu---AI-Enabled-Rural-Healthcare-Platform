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

  // Initialize socket connection
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      console.log('[WebRTC] Connecting to signaling server:', SIGNALING_SERVER_URL)
      
      this.socket = io(SIGNALING_SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000,
      })

      const connectTimeout = setTimeout(() => {
        reject(new Error('Connection timeout'))
      }, 15000)

      this.socket.on('connect', () => {
        clearTimeout(connectTimeout)
        console.log('[WebRTC] Connected to signaling server, socket id:', this.socket?.id)
        resolve()
      })

      this.socket.on('connect_error', (error) => {
        clearTimeout(connectTimeout)
        console.error('[WebRTC] Connection error:', error)
        reject(error)
      })

      this.setupSocketListeners()
    })
  }

  private setupSocketListeners() {
    if (!this.socket) return

    // Room joined confirmation
    this.socket.on('room-joined', async (data: { roomId: string; participants: Participant[]; isInitiator: boolean }) => {
      console.log('[WebRTC] Room joined:', data, 'isInitiator:', data.isInitiator)
      
      // The person who joins SECOND is the initiator (creates the offer)
      // The person who joined FIRST waits and answers
      this.isPolite = data.participants.length === 0 // First joiner is polite (will answer)
      
      // Only create offer if we're joining an existing room (we're the second person)
      if (data.participants.length > 0) {
        console.log('[WebRTC] Someone already in room, we are initiator - creating offer...')
        // Small delay to ensure peer connection is ready
        setTimeout(() => this.createOffer(), 500)
      } else {
        console.log('[WebRTC] We are first in room, waiting for peer to join and send offer...')
      }
    })

    // Room full
    this.socket.on('room-full', () => {
      console.log('[WebRTC] Room is full')
      this.callbacks.onRoomFull?.()
    })

    // Peer joined - the first person receives this when second person joins
    // The second person will create the offer, first person just waits
    this.socket.on('peer-joined', (participant: Participant) => {
      console.log('[WebRTC] Peer joined (we were first), waiting for their offer:', participant)
      this.callbacks.onPeerJoined?.(participant)
      // Don't create offer here - the new joiner will do it
    })

    // Peer left
    this.socket.on('peer-left', (participant: Participant) => {
      console.log('[WebRTC] Peer left:', participant)
      this.callbacks.onPeerLeft?.(participant)
      this.cleanupPeerConnection()
    })

    // Receive offer
    this.socket.on('offer', async (data: { offer: RTCSessionDescriptionInit; from: string }) => {
      console.log('[WebRTC] Received offer from:', data.from)
      
      // Perfect negotiation pattern
      const offerCollision = this.makingOffer || this.peerConnection?.signalingState !== 'stable'
      this.ignoreOffer = !this.isPolite && offerCollision
      
      if (this.ignoreOffer) {
        console.log('[WebRTC] Ignoring offer due to collision')
        return
      }
      
      await this.handleOffer(data.offer)
    })

    // Receive answer
    this.socket.on('answer', async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
      console.log('[WebRTC] Received answer from:', data.from)
      await this.handleAnswer(data.answer)
    })

    // Receive ICE candidate
    this.socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit; from: string }) => {
      console.log('[WebRTC] Received ICE candidate')
      await this.handleIceCandidate(data.candidate)
    })

    // Chat message from server
    this.socket.on('chat-message', (message: ChatMessage) => {
      console.log('[WebRTC] Chat message received:', message)
      this.callbacks.onChatMessage?.(message)
    })

    // Call ended
    this.socket.on('call-ended', () => {
      console.log('[WebRTC] Call ended by peer')
      this.callbacks.onCallEnded?.()
      this.cleanup()
    })

    // Peer media toggle
    this.socket.on('peer-media-toggle', (data: { odId: string; type: 'audio' | 'video'; enabled: boolean }) => {
      console.log('[WebRTC] Peer media toggle:', data)
      this.callbacks.onPeerMediaToggle?.(data)
    })
  }

  // Get user media (camera & microphone)
  async getUserMedia(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    const defaultConstraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        facingMode: 'user',
        frameRate: { ideal: 30 },
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    }

    try {
      console.log('[WebRTC] Requesting user media...')
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints || defaultConstraints)
      console.log('[WebRTC] Got local stream with tracks:', this.localStream.getTracks().map(t => `${t.kind}:${t.enabled}`))
      this.callbacks.onLocalStream?.(this.localStream)
      return this.localStream
    } catch (error) {
      console.error('[WebRTC] Error getting user media:', error)
      this.callbacks.onError?.(error as Error)
      throw error
    }
  }

  // Join a consultation room
  async joinRoom(roomId: string, userName: string, role: 'PATIENT' | 'DOCTOR'): Promise<void> {
    if (!this.socket?.connected) {
      await this.connect()
    }

    this.currentRoomId = roomId
    this.currentUserName = userName
    this.currentRole = role
    this.currentUserId = `${role.toLowerCase()}-${Date.now()}`
    
    // Create peer connection before joining
    this.createPeerConnection()
    
    this.socket?.emit('join-room', { roomId, odName: userName, role })
    console.log(`[WebRTC] Joining room: ${roomId} as ${userName} (${role})`)
  }

  // Create peer connection
  private createPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) {
      return this.peerConnection
    }

    console.log('[WebRTC] Creating peer connection...')
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS)

    // Add local tracks to peer connection
    if (this.localStream) {
      console.log('[WebRTC] Adding local tracks to peer connection')
      this.localStream.getTracks().forEach((track) => {
        console.log(`[WebRTC] Adding track: ${track.kind}`)
        this.peerConnection!.addTrack(track, this.localStream!)
      })
    }

    // Handle incoming tracks (remote stream)
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Received remote track:', event.track.kind, 'streams:', event.streams.length)
      
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0]
        console.log('[WebRTC] Using stream from event')
      } else {
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream()
        }
        this.remoteStream.addTrack(event.track)
        console.log('[WebRTC] Created new remote stream and added track')
      }
      
      this.callbacks.onRemoteStream?.(this.remoteStream)
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.currentRoomId) {
        console.log('[WebRTC] Sending ICE candidate')
        this.socket?.emit('ice-candidate', {
          roomId: this.currentRoomId,
          candidate: event.candidate.toJSON(),
        })
      }
    }

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState
      console.log('[WebRTC] Connection state:', state)
      if (state) {
        this.callbacks.onConnectionStateChange?.(state)
      }
    }

    // Handle ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', this.peerConnection?.iceConnectionState)
    }

    // Handle negotiation needed
    this.peerConnection.onnegotiationneeded = async () => {
      console.log('[WebRTC] Negotiation needed')
      try {
        this.makingOffer = true
        await this.peerConnection?.setLocalDescription()
        this.socket?.emit('offer', {
          roomId: this.currentRoomId,
          offer: this.peerConnection?.localDescription,
        })
      } catch (err) {
        console.error('[WebRTC] Error during negotiation:', err)
      } finally {
        this.makingOffer = false
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
      console.log('[WebRTC] Creating offer...')
      
      const offer = await this.peerConnection!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      
      await this.peerConnection!.setLocalDescription(offer)

      this.socket?.emit('offer', {
        roomId: this.currentRoomId,
        offer: this.peerConnection!.localDescription,
      })
      console.log('[WebRTC] Offer sent')
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
      
      console.log('[WebRTC] Setting remote description from offer...')
      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer))

      // Add any pending ICE candidates
      console.log('[WebRTC] Adding', this.pendingCandidates.length, 'pending ICE candidates')
      for (const candidate of this.pendingCandidates) {
        await this.peerConnection!.addIceCandidate(new RTCIceCandidate(candidate))
      }
      this.pendingCandidates = []

      console.log('[WebRTC] Creating answer...')
      const answer = await this.peerConnection!.createAnswer()
      await this.peerConnection!.setLocalDescription(answer)

      this.socket?.emit('answer', {
        roomId: this.currentRoomId,
        answer: this.peerConnection!.localDescription,
      })
      console.log('[WebRTC] Answer sent')
    } catch (error) {
      console.error('[WebRTC] Error handling offer:', error)
      this.callbacks.onError?.(error as Error)
    }
  }

  // Handle incoming answer
  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (this.peerConnection) {
        console.log('[WebRTC] Setting remote description from answer...')
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))

        // Add any pending ICE candidates
        console.log('[WebRTC] Adding', this.pendingCandidates.length, 'pending ICE candidates')
        for (const candidate of this.pendingCandidates) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        }
        this.pendingCandidates = []
        console.log('[WebRTC] Answer processed')
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
        console.log('[WebRTC] ICE candidate added')
      } else {
        // Queue candidate if remote description not set yet
        console.log('[WebRTC] Queueing ICE candidate')
        this.pendingCandidates.push(candidate)
      }
    } catch (error) {
      console.error('[WebRTC] Error adding ICE candidate:', error)
    }
  }

  // Send chat message
  sendChatMessage(text: string, senderId: string, senderName: string, senderRole: 'PATIENT' | 'DOCTOR'): void {
    if (!this.currentRoomId || !this.socket) {
      console.warn('[WebRTC] Cannot send message - not in room')
      return
    }

    console.log('[WebRTC] Sending chat message:', text)
    this.socket.emit('chat-message', {
      roomId: this.currentRoomId,
      message: {
        senderId,
        senderName,
        senderRole,
        text,
      },
    })
  }

  // Toggle audio
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled
        console.log('[WebRTC] Audio track enabled:', enabled)
      })
      if (this.currentRoomId) {
        this.socket?.emit('media-toggle', {
          roomId: this.currentRoomId,
          type: 'audio',
          enabled,
        })
      }
    }
  }

  // Toggle video
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled
        console.log('[WebRTC] Video track enabled:', enabled)
      })
      if (this.currentRoomId) {
        this.socket?.emit('media-toggle', {
          roomId: this.currentRoomId,
          type: 'video',
          enabled,
        })
      }
    }
  }

  // End call
  endCall(): void {
    if (this.currentRoomId) {
      this.socket?.emit('end-call', this.currentRoomId)
    }
    this.cleanup()
  }

  // Leave room without ending call for others
  leaveRoom(): void {
    if (this.currentRoomId) {
      this.socket?.emit('leave-room', this.currentRoomId)
    }
    this.cleanup()
  }

  // Set callbacks
  setCallbacks(callbacks: WebRTCCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  // Clean up peer connection
  private cleanupPeerConnection(): void {
    if (this.peerConnection) {
      this.peerConnection.ontrack = null
      this.peerConnection.onicecandidate = null
      this.peerConnection.onconnectionstatechange = null
      this.peerConnection.oniceconnectionstatechange = null
      this.peerConnection.onnegotiationneeded = null
      this.peerConnection.close()
      this.peerConnection = null
    }
    this.remoteStream = null
    this.pendingCandidates = []
    this.makingOffer = false
    this.ignoreOffer = false
  }

  // Full cleanup
  cleanup(): void {
    this.cleanupPeerConnection()

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop()
        console.log('[WebRTC] Stopped track:', track.kind)
      })
      this.localStream = null
    }

    this.currentRoomId = null
  }

  // Disconnect socket
  disconnect(): void {
    this.cleanup()
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  // Get remote stream
  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }

  // Check if connected
  isSocketConnected(): boolean {
    return this.socket?.connected ?? false
  }

  // Get current room ID
  getCurrentRoomId(): string | null {
    return this.currentRoomId
  }
  
  // Get current user info
  getCurrentUserInfo() {
    return {
      id: this.currentUserId,
      name: this.currentUserName,
      role: this.currentRole,
    }
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService()
