import { useState, useEffect, useCallback, useRef } from 'react'
import { WebRTCService, type ChatMessage, type Participant, type WebRTCCallbacks } from '../services/webrtcService'

export interface UseWebRTCOptions {
  roomId: string
  userName: string
  role: 'PATIENT' | 'DOCTOR'
  autoJoin?: boolean
}

export interface UseWebRTCReturn {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isConnected: boolean
  isCallActive: boolean
  connectionState: RTCPeerConnectionState | null
  peer: Participant | null
  messages: ChatMessage[]
  error: Error | null
  isRoomFull: boolean
  isAudioEnabled: boolean
  isVideoEnabled: boolean
  isPeerAudioEnabled: boolean
  isPeerVideoEnabled: boolean
  joinRoom: () => Promise<void>
  leaveRoom: () => void
  endCall: () => void
  toggleAudio: () => void
  toggleVideo: () => void
  sendMessage: (text: string) => void
  localVideoRef: React.RefObject<HTMLVideoElement>
  remoteVideoRef: React.RefObject<HTMLVideoElement>
}

export function useWebRTC(options: UseWebRTCOptions): UseWebRTCReturn {
  const { roomId, userName, role, autoJoin = false } = options

  // Service ref — populated once on mount, never recreated
  const svcRef = useRef<WebRTCService | null>(null)

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | null>(null)
  const [peer, setPeer] = useState<Participant | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isRoomFull, setIsRoomFull] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isPeerAudioEnabled, setIsPeerAudioEnabled] = useState(true)
  const [isPeerVideoEnabled, setIsPeerVideoEnabled] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const isJoined = useRef(false)
  const messageIds = useRef<Set<string>>(new Set())

  const attachStream = (ref: React.RefObject<HTMLVideoElement>, stream: MediaStream | null) => {
    const doAttach = () => {
      if (!ref.current) return
      if (ref.current.srcObject !== stream) {
        ref.current.srcObject = stream
      }
      if (stream) ref.current.play().catch(() => {})
    }
    doAttach()
    // Retry after next paint in case element wasn't in DOM yet
    requestAnimationFrame(doAttach)
  }

  // Create service and register callbacks on mount; destroy on unmount
  useEffect(() => {
    const svc = new WebRTCService()
    svcRef.current = svc

    const callbacks: WebRTCCallbacks = {
      onLocalStream: (stream) => {
        setLocalStream(stream)
        attachStream(localVideoRef, stream)
      },
      onRemoteStream: (stream) => {
        console.log('[useWebRTC] Remote stream received, tracks:', stream.getTracks().map(t => t.kind))
        setRemoteStream(stream)
        setIsCallActive(true)
        attachStream(remoteVideoRef, stream)
      },
      onPeerJoined: (participant) => setPeer(participant),
      onPeerLeft: () => {
        setPeer(null)
        setRemoteStream(null)
        setIsCallActive(false)
        attachStream(remoteVideoRef, null)
      },
      onChatMessage: (message) => {
        if (!messageIds.current.has(message.id)) {
          messageIds.current.add(message.id)
          setMessages((prev) => [...prev, message])
        }
      },
      onCallEnded: () => {
        setIsCallActive(false)
        setPeer(null)
        setRemoteStream(null)
        attachStream(remoteVideoRef, null)
      },
      onConnectionStateChange: (state) => {
        setConnectionState(state)
        if (state === 'connected') setIsCallActive(true)
        else if (state === 'disconnected' || state === 'failed' || state === 'closed') setIsCallActive(false)
      },
      onError: (err) => setError(err),
      onRoomFull: () => {
        setIsRoomFull(true)
        setError(new Error('Room is full. Maximum 2 participants allowed.'))
      },
      onPeerMediaToggle: (data) => {
        if (data.type === 'audio') setIsPeerAudioEnabled(data.enabled)
        else setIsPeerVideoEnabled(data.enabled)
      },
    }
    svc.setCallbacks(callbacks)

    return () => {
      if (isJoined.current) svc.leaveRoom()
      else svc.disconnect()
      isJoined.current = false
      svcRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-attach streams when they change (handles hasJoined render gate)
  useEffect(() => {
    if (localStream && localVideoRef.current) attachStream(localVideoRef, localStream)
  }, [localStream])

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) attachStream(remoteVideoRef, remoteStream)
  }, [remoteStream])

  const joinRoom = useCallback(async () => {
    const svc = svcRef.current
    if (!svc) { console.error('[useWebRTC] svcRef is null — service not mounted yet'); return }
    try {
      setError(null)
      setIsRoomFull(false)
      setMessages([])
      messageIds.current.clear()

      console.log('[useWebRTC] Connecting...')
      await svc.connect()
      setIsConnected(true)

      console.log('[useWebRTC] Getting media for', userName, role)
      await svc.getUserMedia(userName, role)

      console.log('[useWebRTC] Joining room:', roomId)
      await svc.joinRoom(roomId, userName, role)
      isJoined.current = true
      console.log('[useWebRTC] Joined room, announcing to peers')
    } catch (err) {
      console.error('[useWebRTC] joinRoom error:', err)
      setError(err as Error)
      throw err
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userName, role])

  useEffect(() => {
    if (autoJoin && !isJoined.current) {
      joinRoom().catch(console.error)
    }
  }, [autoJoin, joinRoom])

  const leaveRoom = useCallback(() => {
    svcRef.current?.leaveRoom()
    setLocalStream(null); setRemoteStream(null); setIsCallActive(false)
    setPeer(null); setIsConnected(false); setMessages([])
    messageIds.current.clear()
    isJoined.current = false
  }, [])

  const endCall = useCallback(() => {
    svcRef.current?.endCall()
    setLocalStream(null); setRemoteStream(null); setIsCallActive(false)
    setPeer(null); setIsConnected(false); setMessages([])
    messageIds.current.clear()
    isJoined.current = false
  }, [])

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => {
      const next = !prev
      svcRef.current?.toggleAudio(next)
      return next
    })
  }, [])

  const toggleVideo = useCallback(() => {
    setIsVideoEnabled(prev => {
      const next = !prev
      svcRef.current?.toggleVideo(next)
      return next
    })
  }, [])

  const sendMessage = useCallback((text: string) => {
    const svc = svcRef.current
    if (!svc || !text.trim()) return
    const info = svc.getCurrentUserInfo()
    svc.sendChatMessage(text.trim(), info.id, userName, role)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName, role])

  return {
    localStream, remoteStream,
    isConnected, isCallActive, connectionState, peer, messages, error, isRoomFull,
    isAudioEnabled, isVideoEnabled, isPeerAudioEnabled, isPeerVideoEnabled,
    joinRoom, leaveRoom, endCall, toggleAudio, toggleVideo, sendMessage,
    localVideoRef, remoteVideoRef,
  }
}

export default useWebRTC
