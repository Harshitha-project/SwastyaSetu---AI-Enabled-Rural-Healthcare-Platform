import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/role.middleware'
import {
  getMyProfile,
  updateMyProfile,
  getAssignedPatients,
  getDashboardStats,
  listHealthWorkers,
  getHealthWorkerById,
  assignPatient,
} from '../controllers/healthWorker.controller'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Health Worker routes
// GET /api/health-workers/me - Get my profile
router.get('/me', authorize('HEALTH_WORKER'), getMyProfile)

// PUT /api/health-workers/me - Update my profile
router.put('/me', authorize('HEALTH_WORKER'), updateMyProfile)

// GET /api/health-workers/me/patients - Get assigned patients
router.get('/me/patients', authorize('HEALTH_WORKER'), getAssignedPatients)

// GET /api/health-workers/me/stats - Get dashboard stats
router.get('/me/stats', authorize('HEALTH_WORKER'), getDashboardStats)

// Admin routes
// GET /api/health-workers - List all health workers
router.get('/', authorize('ADMIN'), listHealthWorkers)

// POST /api/health-workers/assign - Assign patient to worker
router.post('/assign', authorize('ADMIN'), assignPatient)

// GET /api/health-workers/:id - Get health worker by ID
router.get('/:id', authorize('ADMIN'), getHealthWorkerById)

export default router
