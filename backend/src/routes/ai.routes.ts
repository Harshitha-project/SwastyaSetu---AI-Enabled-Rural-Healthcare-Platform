import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { aiLimiter } from '../middleware/rateLimit.middleware'
import {
  createAssessment,
  getAssessmentHistory,
  getMyAssessments,
  symptomCheck,
  getAssessmentById,
} from '../controllers/ai.controller'

const router = Router()

// All routes require authentication
router.use(authenticate)

// POST /api/ai/assessment - Create AI health assessment
router.post('/assessment', aiLimiter, createAssessment)

// GET /api/ai/assessments/me - Get my assessment history (patients)
router.get('/assessments/me', getMyAssessments)

// GET /api/ai/assessments/:patientId - Get assessment history for a patient
router.get('/assessments/:patientId', getAssessmentHistory)

// GET /api/ai/assessment/:id - Get specific assessment
router.get('/assessment/:id', getAssessmentById)

// POST /api/ai/symptom-check - Quick symptom analysis
router.post('/symptom-check', aiLimiter, symptomCheck)

export default router
