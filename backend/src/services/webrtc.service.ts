import { Server as SocketIOServer, Socket } from 'socket.io'
import { Server as HTTPServer } from 'http'

interface RoomParticipant {
  odId: string
  odName: string
  role: 'PATIENT' | 'DOCTOR'
  joinedAt: Date
}

interface Room {
  id: string
  participants: Map<string, RoomParticipant>
  createdAt: Date
}

interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderRole: 'PATIENT' | 'DOCTOR'
  text: string
  timestamp: string
}

// Generic types for WebRTC signaling (these are browser APIs, we just pass them through)
type RTCSessionDescription = Record<string, unknown>
type RTCIceCandidate = Record<string, unknown>

class WebRTCSignalingService {
  private io: SocketIOServer | null = null
  private rooms: Map<string, Room> = new Map()
  private socketToRoom: Map<string, string> = new Map()

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    })

    this.io.on('connection', (socket: Socket) => {
      console.log(`[WebRTC] Client connected: ${socket.id}`)

      // Join a consultation room
      socket.on('join-room', (data: { roomId: string; odName: string; role: 'PATIENT' | 'DOCTOR' }) => {
        this.handleJoinRoom(socket, data)
      })

      // WebRTC Signaling: Offer
      socket.on('offer', (data: { roomId: string; offer: RTCSessionDescription }) => {
        console.log(`[WebRTC] Offer from ${socket.id} in room ${data.roomId}`)
        socket.to(data.roomId).emit('offer', {
          offer: data.offer,
          from: socket.id,
        })
      })

      // WebRTC Signaling: Answer
      socket.on('answer', (data: { roomId: string; answer: RTCSessionDescription }) => {
        console.log(`[WebRTC] Answer from ${socket.id} in room ${data.roomId} - forwarding to peer`)
        socket.to(data.roomId).emit('answer', {
          answer: data.answer,
          from: socket.id,
        })
      })

      // WebRTC Signaling: ICE Candidate
      socket.on('ice-candidate', (data: { roomId: string; candidate: RTCIceCandidate }) => {
        console.log(`[WebRTC] ICE candidate from ${socket.id} in room ${data.roomId}`)
        socket.to(data.roomId).emit('ice-candidate', {
          candidate: data.candidate,
          from: socket.id,
        })
      })

      // Chat message
      socket.on('chat-message', (data: { roomId: string; message: Omit<ChatMessage, 'id' | 'timestamp'> }) => {
        const chatMessage: ChatMessage = {
          ...data.message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          roomId: data.roomId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        console.log(`[Chat] Message in room ${data.roomId} from ${data.message.senderName}`)
        this.io?.to(data.roomId).emit('chat-message', chatMessage)
      })

      // Toggle audio/video
      socket.on('media-toggle', (data: { roomId: string; type: 'audio' | 'video'; enabled: boolean }) => {
        socket.to(data.roomId).emit('peer-media-toggle', {
          odId: socket.id,
          type: data.type,
          enabled: data.enabled,
        })
      })

      // Leave room
      socket.on('leave-room', (roomId: string) => {
        this.handleLeaveRoom(socket, roomId)
      })

      // End call
      socket.on('end-call', (roomId: string) => {
        console.log(`[WebRTC] Call ended in room ${roomId} by ${socket.id}`)
        this.io?.to(roomId).emit('call-ended', { endedBy: socket.id })
        this.handleLeaveRoom(socket, roomId)
      })

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`[WebRTC] Client disconnected: ${socket.id}`)
        const roomId = this.socketToRoom.get(socket.id)
        if (roomId) {
          this.handleLeaveRoom(socket, roomId)
        }
      })
    })

    console.log('[WebRTC] Signaling server initialized')
  }

  private handleJoinRoom(socket: Socket, data: { roomId: string; odName: string; role: 'PATIENT' | 'DOCTOR' }) {
    const { roomId, odName, role } = data

    // Create room if doesn't exist
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        participants: new Map(),
        createdAt: new Date(),
      })
    }

    const room = this.rooms.get(roomId)!

    // Check if room is full (max 2 participants for 1:1 consultation)
    if (room.participants.size >= 2) {
      socket.emit('room-full', { roomId })
      return
    }

    // Add participant to room
    room.participants.set(socket.id, {
      odId: socket.id,
      odName,
      role,
      joinedAt: new Date(),
    })

    this.socketToRoom.set(socket.id, roomId)
    socket.join(roomId)

    console.log(`[WebRTC] ${odName} (${role}) joined room ${roomId}. Participants: ${room.participants.size}`)

    // Notify others in the room
    socket.to(roomId).emit('peer-joined', {
      odId: socket.id,
      odName,
      role,
    })

    // Send room info to the joining user
    const otherParticipants = Array.from(room.participants.entries())
      .filter(([id]) => id !== socket.id)
      .map(([id, p]) => ({ odId: id, odName: p.odName, role: p.role }))

    socket.emit('room-joined', {
      roomId,
      participants: otherParticipants,
      isInitiator: otherParticipants.length > 0, // If someone is already in, this user initiates the call
    })
  }

  private handleLeaveRoom(socket: Socket, roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return

    const participant = room.participants.get(socket.id)
    if (participant) {
      console.log(`[WebRTC] ${participant.odName} left room ${roomId}`)
      room.participants.delete(socket.id)
      this.socketToRoom.delete(socket.id)
      socket.leave(roomId)

      // Notify others
      socket.to(roomId).emit('peer-left', {
        odId: socket.id,
        odName: participant.odName,
        role: participant.role,
      })

      // Clean up empty rooms
      if (room.participants.size === 0) {
        this.rooms.delete(roomId)
        console.log(`[WebRTC] Room ${roomId} deleted (empty)`)
      }
    }
  }

  getRoomInfo(roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return null

    return {
      id: room.id,
      participants: Array.from(room.participants.values()),
      createdAt: room.createdAt,
    }
  }

  getActiveRooms() {
    return Array.from(this.rooms.entries()).map(([id, room]) => ({
      id,
      participantCount: room.participants.size,
      createdAt: room.createdAt,
    }))
  }
}

export const webrtcService = new WebRTCSignalingService()
