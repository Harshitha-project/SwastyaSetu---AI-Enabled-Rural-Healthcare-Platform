import { useState, useEffect, useCallback, useRef } from 'react'
import { webrtcService, type ChatMessage, type Participant, type WebRTCCallbacks } from '../services/webrtcService'

export interface UseWebRTCOptions {
  roomId: string
  userName: string
  role: 'PATIENT' | 'DOCTOR'
  autoJoin?: boolean
}

export interface UseWebRTCReturn {
  // Streams
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  
  // State
  isConnected: boolean
  isCallActive: boolean
  connectionState: RTCPeerConnectionState | null
  peer: Participant | null
  messages: ChatMessage[]
  error: Error | null
  isRoomFull: boolean
  
  // Media state
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isPeerAudioEnabled: boolean
  isPeerVideoEnabled: boolean
  
  // Actions
  joinRoom: () => Promise<void>
  leaveRoom: () => void
  endCall: () => void
  toggleAudio: () => void
  toggleVideo: () => void
  sendMessage: (text: string) => void
  
  // Refs for video elements
  localVideoRef: React.RefObject<HTMLVideoElement>
  remoteVideoRef: React.RefObject<HTMLVideoElement>
}

export function useWebRTC(options: UseWebRTCOptions): UseWebRTCReturn {
  const { roomId, userName, role, autoJoin = false } = options

  // Stream state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)

  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | null>(null)
  const [peer, setPeer] = useState<Participant | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isRoomFull, setIsRoomFull] = useState(false)

  // Media state
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isPeerAudioEnabled, setIsPeerAudioEnabled] = useState(true)
  const [isPeerVideoEnabled, setIsPeerVideoEnabled] = useState(true)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])

  // Video element refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  // Track if we've initialized
  const isInitialized = useRef(false)
  
  // Track message IDs to prevent duplicates
  const messageIds = useRef<Set<string>>(new Set())

  // Attach stream to video element with retry
  const attachStreamToVideo = useCallback((videoRef: React.RefObject<HTMLVideoElement>, stream: MediaStream | null, retries = 5) => {
    const attempt = (remaining: number) => {
      if (!stream) {
        if (videoRef.current) videoRef.current.srcObject = null
        return
      }
      
      if (videoRef.current) {
        console.log(`[useWebRTC] Attaching stream to video, tracks: ${stream.getTracks().map(t => t.kind).join(', ')}`)
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(e => {
          console.log('[useWebRTC] Video play error:', e.message)
          // Retry if element not ready
          if (remaining > 0) {
            setTimeout(() => attempt(remaining - 1), 200)
          }
        })
      } else if (remaining > 0) {
        // Ref not ready yet, retry
        setTimeout(() => attempt(remaining - 1), 200)
      }
    }
    attempt(retries)
  }, [])

  // Set up callbacks
  useEffect(() => {
    const callbacks: WebRTCCallbacks = {
      onLocalStream: (stream) => {
        console.log('[useWebRTC] Local stream received, tracks:', stream.getTracks().length)
        setLocalStream(stream)
        // Attach to video element
        setTimeout(() => attachStreamToVideo(localVideoRef, stream), 100)
      },
      onRemoteStream: (stream) => {
        console.log('[useWebRTC] Remote stream received, tracks:', stream.getTracks().map(t => `${t.kind}:${t.readyState}`))
        setRemoteStream(stream)
        setIsCallActive(true)
        // Attach with aggressive retry since video element might not exist yet
        attachStreamToVideo(remoteVideoRef, stream, 10)
      },
      onPeerJoined: (participant) => {
        console.log('[useWebRTC] Peer joined:', participant)
        setPeer(participant)
      },
      onPeerLeft: (participant) => {
        console.log('[useWebRTC] Peer left:', participant)
        setPeer(null)
        setRemoteStream(null)
        setIsCallActive(false)
        attachStreamToVideo(remoteVideoRef, null)
      },
      onChatMessage: (message) => {
        // Prevent duplicate messages
        if (!messageIds.current.has(message.id)) {
          messageIds.current.add(message.id)
          setMessages((prev) => [...prev, message])
        }
      },
      onCallEnded: () => {
        console.log('[useWebRTC] Call ended')
        setIsCallActive(false)
        setPeer(null)
        setRemoteStream(null)
        attachStreamToVideo(remoteVideoRef, null)
      },
      onConnectionStateChange: (state) => {
        console.log('[useWebRTC] Connection state changed:', state)
        setConnectionState(state)
        if (state === 'connected') {
          setIsCallActive(true)
        } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          setIsCallActive(false)
        }
      },
      onError: (err) => {
        console.error('[useWebRTC] Error:', err)
        setError(err)
      },
      onRoomFull: () => {
        setIsRoomFull(true)
        setError(new Error('Room is full. Maximum 2 participants allowed.'))
      },
      onPeerMediaToggle: (data) => {
        console.log('[useWebRTC] Peer media toggle:', data)
        if (data.type === 'audio') {
          setIsPeerAudioEnabled(data.enabled)
        } else {
          setIsPeerVideoEnabled(data.enabled)
        }
      },
    }

    webrtcService.setCallbacks(callbacks)
  }, [attachStreamToVideo])

  // Update video elements when streams change
  useEffect(() => {
    attachStreamToVideo(localVideoRef, localStream)
  }, [localStream, attachStreamToVideo])

  useEffect(() => {
    attachStreamToVideo(remoteVideoRef, remoteStream)
  }, [remoteStream, attachStreamToVideo])

  // Join room function
  const joinRoom = useCallback(async () => {
    try {
      setError(null)
      setIsRoomFull(false)
      setMessages([])
      messageIds.current.clear()

      console.log('[useWebRTC] Starting join process...')

      // Connect to signaling server
      await webrtcService.connect()
      setIsConnected(true)
      console.log('[useWebRTC] Connected to signaling server')

      // Get user media first
      const stream = await webrtcService.getUserMedia()
      console.log('[useWebRTC] Got user media, tracks:', stream.getTracks().length)

      // Join the room
      await webrtcService.joinRoom(roomId, userName, role)
      console.log('[useWebRTC] Joined room:', roomId)

      isInitialized.current = true
    } catch (err) {
      console.error('[useWebRTC] Failed to join room:', err)
      setError(err as Error)
      throw err
    }
  }, [roomId, userName, role])

  // Auto-join if enabled
  useEffect(() => {
    if (autoJoin && !isInitialized.current) {
      joinRoom().catch(console.error)
    }

    // Cleanup on unmount
    return () => {
      if (isInitialized.current) {
        console.log('[useWebRTC] Cleaning up on unmount')
        webrtcService.leaveRoom()
        isInitialized.current = false
      }
    }
  }, [autoJoin, joinRoom])

  // Leave room
  const leaveRoom = useCallback(() => {
    webrtcService.leaveRoom()
    setLocalStream(null)
    setRemoteStream(null)
    setIsCallActive(false)
    setPeer(null)
    setIsConnected(false)
    setMessages([])
    messageIds.current.clear()
    isInitialized.current = false
  }, [])

  // End call
  const endCall = useCallback(() => {
    webrtcService.endCall()
    setLocalStream(null)
    setRemoteStream(null)
    setIsCallActive(false)
    setPeer(null)
    setIsConnected(false)
    setMessages([])
    messageIds.current.clear()
    isInitialized.current = false
  }, [])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    const newState = !isAudioEnabled
    webrtcService.toggleAudio(newState)
    setIsAudioEnabled(newState)
  }, [isAudioEnabled])

  // Toggle video
  const toggleVideo = useCallback(() => {
    const newState = !isVideoEnabled
    webrtcService.toggleVideo(newState)
    setIsVideoEnabled(newState)
  }, [isVideoEnabled])

  // Send message
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return
      
      const userInfo = webrtcService.getCurrentUserInfo()
      webrtcService.sendChatMessage(text.trim(), userInfo.id, userName, role)
    },
    [userName, role]
  )

  return {
    // Streams
    localStream,
    remoteStream,

    // State
    isConnected,
    isCallActive,
    connectionState,
    peer,
    messages,
    error,
    isRoomFull,

    // Media state
    isAudioEnabled,
    isVideoEnabled,
    isPeerAudioEnabled,
    isPeerVideoEnabled,

    // Actions
    joinRoom,
    leaveRoom,
    endCall,
    toggleAudio,
    toggleVideo,
    sendMessage,

    // Refs
    localVideoRef,
    remoteVideoRef,
  }
}

export default useWebRTC
