import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/role.middleware'
import {
  startConsultation,
  getConsultationById,
  listConsultations,
  sendMessage,
  getMessages,
  endConsultation,
  getActiveConsultation,
  markMessagesRead,
  getConsultationWithPrescription,
} from '../controllers/consultation.controller'

const router = Router()

// All routes require authentication
router.use(authenticate)

// GET /api/consultations/active - Get active consultation
router.get('/active', getActiveConsultation)

// GET /api/consultations - List consultations
router.get('/', listConsultations)

// POST /api/consultations/start - Start a consultation
router.post('/start', authorize('DOCTOR'), startConsultation)

// GET /api/consultations/:id - Get consultation by ID
router.get('/:id', getConsultationById)

// GET /api/consultations/:id/with-prescription - Get consultation with prescription
router.get('/:id/with-prescription', getConsultationWithPrescription)

// POST /api/consultations/:id/messages - Send message
router.post('/:id/messages', sendMessage)

// GET /api/consultations/:id/messages - Get messages
router.get('/:id/messages', getMessages)

// PUT /api/consultations/:id/messages/read - Mark messages as read
router.put('/:id/messages/read', markMessagesRead)

// PUT /api/consultations/:id/end - End consultation
router.put('/:id/end', authorize('DOCTOR'), endConsultation)

export default router
