import { Router } from 'express'
import authRoutes from './auth.routes'
import prescriptionRoutes from './prescription.routes'
import emergencyRoutes from './emergency.routes'
import schemesRoutes from './schemes.routes'
import healthRecordsRoutes from './healthRecords.routes'

const router = Router()

// Mount auth routes (Prisma-based, fully working)
router.use('/auth', authRoutes)

// Mount prescription routes (Prisma-based, fully working)
router.use('/prescriptions', prescriptionRoutes)

// Mount emergency routes
router.use('/emergency', emergencyRoutes)

// Mount government schemes and insurance routes
router.use('/schemes', schemesRoutes)

// Mount health records routes
router.use('/health-records', healthRecordsRoutes)

// Placeholder routes for other endpoints (being migrated to Prisma)
const placeholderRouter = Router()
placeholderRouter.all('*', (_req, res) => {
  res.status(503).json({
    success: false,
    message: 'This endpoint is being migrated to PostgreSQL. Please try again later.',
  })
})

router.use('/patients', placeholderRouter)
router.use('/doctors', placeholderRouter)
router.use('/health-workers', placeholderRouter)
router.use('/appointments', placeholderRouter)
router.use('/consultations', placeholderRouter)
router.use('/health', placeholderRouter)
router.use('/facilities', placeholderRouter)
router.use('/ai', placeholderRouter)
router.use('/notifications', placeholderRouter)
router.use('/reminders', placeholderRouter)
router.use('/admin', placeholderRouter)
router.use('/education', placeholderRouter)

export default router
