import { Router } from 'express'
import {
  getMedicalRecords,
  getMedicalRecordById,
  getLabReports,
  getLabReportById,
  getLabTrends,
  getVaccinations,
  getUpcomingVaccinations,
  getAllergies,
  addAllergy,
  getChronicConditions,
  getHealthSummary,
  shareRecords,
  exportRecords,
} from '../controllers/healthRecords.controller'

const router = Router()

/**
 * Health Records Routes
 * Base path: /api/health-records
 */

// Medical Records
router.get('/records/:patientId', getMedicalRecords)
router.get('/records/detail/:id', getMedicalRecordById)

// Lab Reports
router.get('/labs/:patientId', getLabReports)
router.get('/labs/detail/:id', getLabReportById)
router.get('/labs/:patientId/trends', getLabTrends)

// Vaccinations
router.get('/vaccinations/:patientId', getVaccinations)
router.get('/vaccinations/:patientId/upcoming', getUpcomingVaccinations)

// Allergies
router.get('/allergies/:patientId', getAllergies)
router.post('/allergies', addAllergy)

// Chronic Conditions
router.get('/conditions/:patientId', getChronicConditions)

// Health Summary
router.get('/summary/:patientId', getHealthSummary)

// Share Records
router.post('/share/:patientId', shareRecords)

// Export Records
router.get('/export/:patientId', exportRecords)

export default router
