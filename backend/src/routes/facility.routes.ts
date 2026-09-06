import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/role.middleware'
import {
  listFacilities,
  searchFacilities,
  findNearbyFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  getFacilityStats,
} from '../controllers/facility.controller'

const router = Router()

// Public routes
// GET /api/facilities - List facilities
router.get('/', listFacilities)

// GET /api/facilities/search - Search facilities
router.get('/search', searchFacilities)

// GET /api/facilities/nearby - Find nearby facilities
router.get('/nearby', findNearbyFacilities)

// GET /api/facilities/stats - Get facility statistics
router.get('/stats', getFacilityStats)

// GET /api/facilities/:id - Get facility details
router.get('/:id', getFacilityById)

// Protected routes (Admin only)
// POST /api/facilities - Create facility
router.post('/', authenticate, authorize('ADMIN'), createFacility)

// PUT /api/facilities/:id - Update facility
router.put('/:id', authenticate, authorize('ADMIN'), updateFacility)

export default router
