import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/role.middleware'
import {
  listDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctorProfile,
  getAvailableSlots,
  searchDoctors,
  getDoctorStats,
  getSpecializations,
  updateAvailability,
} from '../controllers/doctor.controller'

const router = Router()

// Public routes
// GET /api/doctors/specializations - Get list of specializations
router.get('/specializations', getSpecializations)

// GET /api/doctors/search - Search doctors
router.get('/search', searchDoctors)

// GET /api/doctors - List all doctors
router.get('/', listDoctors)

// GET /api/doctors/:id/slots - Get available slots for a doctor
router.get('/:id/slots', getAvailableSlots)

// GET /api/doctors/:id - Get doctor by ID
router.get('/:id', getDoctorById)

// Protected routes
// GET /api/doctors/me/profile - Get current doctor's profile
router.get('/me/profile', authenticate, authorize('DOCTOR'), getMyDoctorProfile)

// GET /api/doctors/me/stats - Get doctor statistics
router.get('/me/stats', authenticate, authorize('DOCTOR'), getDoctorStats)

// PUT /api/doctors/me/profile - Update doctor profile
router.put('/me/profile', authenticate, authorize('DOCTOR'), updateDoctorProfile)

// PUT /api/doctors/me/availability - Update availability
router.put('/me/availability', authenticate, authorize('DOCTOR'), updateAvailability)

export default router
