import express, { Application } from 'express'
import { createServer } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import { connectDatabase } from './config/database'
import { env } from './config/env'
import { corsOptions } from './config/cors'
import { apiLimiter } from './middleware/rateLimit.middleware'
import { notFoundHandler, errorHandler } from './middleware/error.middleware'
import { sanitizeInput, securityHeaders, requestId } from './middleware/security.middleware'
import routes from './routes'
import { webrtcService } from './services/webrtc.service'

const app: Application = express()
const httpServer = createServer(app)

// Security middleware
app.use(helmet())
app.use(cors(corsOptions))
app.use(securityHeaders)
app.use(requestId)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Input sanitization
app.use(sanitizeInput)

// Rate limiting
app.use('/api', apiLimiter)

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'SwasthyaSetu API is running',
    version: '1.0.0',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    webrtc: {
      enabled: true,
      activeRooms: webrtcService.getActiveRooms().length,
    },
  })
})

// WebRTC room info endpoint
app.get('/api/webrtc/room/:roomId', (_req, res) => {
  const roomInfo = webrtcService.getRoomInfo(_req.params.roomId)
  if (!roomInfo) {
    return res.status(404).json({ success: false, message: 'Room not found' })
  }
  res.json({ success: true, data: roomInfo })
})

// API routes
app.use('/api', routes)

// 404 handler
app.use(notFoundHandler)

// Global error handler
app.use(errorHandler)

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase()

    // Initialize WebRTC signaling server
    webrtcService.initialize(httpServer)

    // Start listening
    httpServer.listen(env.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   SwasthyaSetu Backend API                                ║
║   Healthcare Beyond Distance                              ║
║                                                           ║
║   Server running on port ${env.port}                         ║
║   Environment: ${env.nodeEnv.padEnd(11)}                        ║
║   API URL: http://localhost:${env.port}/api                  ║
║   WebSocket: ws://localhost:${env.port}                      ║
║   Database: PostgreSQL                                    ║
║                                                           ║
║   WebRTC Signaling: ENABLED                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

// Start the server
startServer()
