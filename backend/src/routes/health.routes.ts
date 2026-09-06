import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { authorize, isHealthcareStaff } from '../middleware/role.middleware'
import {
  recordMetrics,
  getMetrics,
  getLatestMetrics,
  getMetricsTrend,
  getMyMetrics,
  deleteMetric,
} from '../controllers/health.controller'

const router = Router()

// All routes require authentication
router.use(authenticate)

// POST /api/health/metrics - Record health metrics
router.post('/metrics', recordMetrics)

// GET /api/health/metrics/me - Get my metrics (patients)
router.get('/metrics/me', authorize('PATIENT'), getMyMetrics)

// GET /api/health/metrics/:patientId - Get metrics for a patient
router.get('/metrics/:patientId', getMetrics)

// GET /api/health/metrics/:patientId/latest - Get latest metrics
router.get('/metrics/:patientId/latest', getLatestMetrics)

// GET /api/health/metrics/:patientId/trend - Get metrics trend for charts
router.get('/metrics/:patientId/trend', getMetricsTrend)

// DELETE /api/health/metrics/:id - Delete a metric record
router.delete('/metrics/:id', deleteMetric)

export default router
