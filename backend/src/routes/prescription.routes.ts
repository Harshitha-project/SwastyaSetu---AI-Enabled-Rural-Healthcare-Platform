import { Router } from 'express'
import { PrescriptionController } from '../controllers/prescription.controller'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/role.middleware'

const router = Router()
const prescriptionController = new PrescriptionController()

// Public route for prescription verification (anyone can verify)
router.get('/verify/:id', prescriptionController.verifyPrescription)

// Protected routes
router.use(authenticate)

// Create prescription (doctors only)
router.post(
  '/',
  authorize('DOCTOR'),
  prescriptionController.createPrescription
)

// Get prescription by ID
router.get('/:id', prescriptionController.getPrescriptionById)

// Get prescriptions for a patient
router.get('/patient/:patientId', prescriptionController.getPatientPrescriptions)

// Get prescriptions by doctor
router.get(
  '/doctor/:doctorId',
  authorize('DOCTOR', 'ADMIN'),
  prescriptionController.getDoctorPrescriptions
)

// Update prescription (doctors only)
router.put(
  '/:id',
  authorize('DOCTOR'),
  prescriptionController.updatePrescription
)

export default router
