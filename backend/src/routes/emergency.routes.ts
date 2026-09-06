import { Router } from 'express'
import { EmergencyController } from '../controllers/emergency.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()
const emergencyController = new EmergencyController()

// Public routes
router.get('/contacts', emergencyController.getEmergencyContacts)
router.get('/hospitals/nearby', emergencyController.getNearbyHospitals)
router.get('/ambulances/available', emergencyController.getAvailableAmbulances)

// Health alerts (public)
router.get('/alerts', emergencyController.getHealthAlerts)
router.get('/alerts/:id', emergencyController.getHealthAlertById)
router.get('/outbreaks', emergencyController.getDiseaseOutbreaks)
router.get('/camps', emergencyController.getHealthCamps)

// Protected routes
router.use(authenticate)

// SOS Alert routes
router.post('/sos', emergencyController.createSOSAlert)
router.get('/sos/:id', emergencyController.getSOSAlertStatus)
router.put('/sos/:id/cancel', emergencyController.cancelSOSAlert)

// Notify emergency contacts
router.post('/notify', emergencyController.notifyEmergencyContacts)

// Subscribe to alerts
router.post('/subscribe', emergencyController.subscribeToAlerts)

export default router
