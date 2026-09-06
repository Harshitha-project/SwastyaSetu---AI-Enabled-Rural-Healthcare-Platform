import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/role.middleware'
import {
  createReminder,
  getReminders,
  getMyReminders,
  getTodaysReminders,
  markAsTaken,
  updateReminder,
  deactivateReminder,
  deleteReminder,
  getReminderStats,
} from '../controllers/reminder.controller'

const router = Router()

// All routes require authentication
router.use(authenticate)

// GET /api/reminders/me - Get my reminders (patients)
router.get('/me', authorize('PATIENT'), getMyReminders)

// GET /api/reminders/today - Get today's reminder schedule
router.get('/today', authorize('PATIENT'), getTodaysReminders)

// GET /api/reminders/stats - Get reminder statistics
router.get('/stats', authorize('PATIENT'), getReminderStats)

// POST /api/reminders - Create reminder
router.post('/', createReminder)

// GET /api/reminders/:patientId - Get reminders for a patient (healthcare staff)
router.get('/:patientId', getReminders)

// PUT /api/reminders/:id/taken - Mark medicine as taken
router.put('/:id/taken', markAsTaken)

// PUT /api/reminders/:id - Update reminder
router.put('/:id', updateReminder)

// PUT /api/reminders/:id/deactivate - Deactivate reminder
router.put('/:id/deactivate', deactivateReminder)

// DELETE /api/reminders/:id - Delete reminder
router.delete('/:id', deleteReminder)

export default router
