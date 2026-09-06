import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/role.middleware'
import {
  createAppointment,
  listAppointments,
  getUpcomingAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getTodaysAppointments,
  getAppointmentStats,
} from '../controllers/appointment.controller'

const router = Router()

// All routes require authentication
router.use(authenticate)

// GET /api/appointments/upcoming - Get upcoming appointments
router.get('/upcoming', getUpcomingAppointments)

// GET /api/appointments/today - Get today's appointments (doctors)
router.get('/today', authorize('DOCTOR', 'ADMIN'), getTodaysAppointments)

// GET /api/appointments/stats - Get appointment statistics
router.get('/stats', getAppointmentStats)

// POST /api/appointments - Create appointment
router.post('/', authorize('PATIENT', 'HEALTH_WORKER', 'ADMIN'), createAppointment)

// GET /api/appointments - List appointments
router.get('/', listAppointments)

// GET /api/appointments/:id - Get appointment details
router.get('/:id', getAppointmentById)

// PUT /api/appointments/:id - Update appointment
router.put('/:id', updateAppointment)

// PUT /api/appointments/:id/status - Update appointment status
router.put('/:id/status', authorize('DOCTOR', 'ADMIN'), updateAppointmentStatus)

// DELETE /api/appointments/:id - Cancel appointment
router.delete('/:id', cancelAppointment)

export default router
