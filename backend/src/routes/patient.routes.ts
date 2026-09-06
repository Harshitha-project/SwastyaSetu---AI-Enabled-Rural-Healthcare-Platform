import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { authorize, isHealthcareStaff } from '../middleware/role.middleware'
import {
  listPatients,
  getPatientById,
  getMyProfile,
  updatePatient,
  getHealthSummary,
  getMedicalTimeline,
  searchPatients,
  getHighRiskPatients,
} from '../controllers/patient.controller'

const router = Router()

// All routes require authentication
router.use(authenticate)

// GET /api/patients/me - Get current patient's profile
router.get('/me', authorize('PATIENT'), getMyProfile)

// GET /api/patients/search - Search patients (healthcare staff only)
router.get('/search', isHealthcareStaff, searchPatients)

// GET /api/patients/high-risk - List high-risk patients (doctors, admins)
router.get('/high-risk', authorize('DOCTOR', 'ADMIN'), getHighRiskPatients)

// GET /api/patients - List patients (doctors, workers, admins)
router.get('/', isHealthcareStaff, listPatients)

// GET /api/patients/:id - Get patient details
router.get('/:id', getPatientById)

// PUT /api/patients/:id - Update patient profile
router.put('/:id', updatePatient)

// GET /api/patients/:id/health-summary - Get health summary
router.get('/:id/health-summary', getHealthSummary)

// GET /api/patients/:id/timeline - Get medical timeline
router.get('/:id/timeline', getMedicalTimeline)

export default router
