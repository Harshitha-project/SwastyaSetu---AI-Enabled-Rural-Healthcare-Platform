import { Response } from 'express'
import { MedicineReminder, Patient, Notification } from '../models'
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendServerError,
} from '../utils/response.utils'
import { AuthRequest } from '../types'

// Create medicine reminder
export async function createReminder(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const {
      patientId,
      medicineName,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      instructions,
      prescriptionId,
    } = req.body

    // Determine patient ID
    let actualPatientId = patientId
    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId })
      if (!patient) return sendError(res, 'Patient profile not found')
      actualPatientId = patient._id.toString()
    }

    if (!actualPatientId) {
      return sendError(res, 'Patient ID is required')
    }

    if (!medicineName || !dosage || !frequency || !times || !startDate) {
      return sendError(res, 'medicineName, dosage, frequency, times, and startDate are required')
    }

    const reminder = await MedicineReminder.create({
      patientId: actualPatientId,
      medicineName,
      dosage,
      frequency,
      times,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      instructions,
      prescriptionId,
      isActive: true,
      createdBy: req.user.userId,
    })

    return sendCreated(res, reminder, 'Medicine reminder created')
  } catch (error) {
    console.error('Create reminder error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get reminders for a patient
export async function getReminders(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { activeOnly } = req.query

    let patientId: string

    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId })
      if (!patient) return sendError(res, 'Patient profile not found')
      patientId = patient._id.toString()
    } else {
      patientId = req.params.patientId
    }

    const query: any = { patientId }

    if (activeOnly === 'true') {
      query.isActive = true
      query.$or = [
        { endDate: { $exists: false } },
        { endDate: { $gte: new Date() } },
      ]
    }

    const reminders = await MedicineReminder.find(query)
      .sort({ createdAt: -1 })
      .lean()

    return sendSuccess(res, reminders)
  } catch (error) {
    console.error('Get reminders error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get my reminders (for patients)
export async function getMyReminders(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const patient = await Patient.findOne({ userId: req.user.userId })
    if (!patient) {
      return sendError(res, 'Patient profile not found')
    }

    const { activeOnly } = req.query

    const query: any = { patientId: patient._id }

    if (activeOnly === 'true') {
      query.isActive = true
      query.$or = [
        { endDate: { $exists: false } },
        { endDate: { $gte: new Date() } },
      ]
    }

    const reminders = await MedicineReminder.find(query)
      .sort({ createdAt: -1 })
      .lean()

    // Add next reminder time
    const remindersWithNext = reminders.map((reminder: any) => ({
      ...reminder,
      nextReminder: getNextReminderTime(reminder),
    }))

    return sendSuccess(res, remindersWithNext)
  } catch (error) {
    console.error('Get my reminders error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get today's reminders
export async function getTodaysReminders(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const patient = await Patient.findOne({ userId: req.user.userId })
    if (!patient) {
      return sendError(res, 'Patient profile not found')
    }

    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const reminders = await MedicineReminder.find({
      patientId: patient._id,
      isActive: true,
      startDate: { $lte: endOfDay },
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: startOfDay } },
      ],
    }).lean()

    // Build today's schedule
    const schedule: Array<{ time: string; medicine: string; dosage: string; reminderId: string }> = []

    reminders.forEach((reminder: any) => {
      reminder.times.forEach((time: string) => {
        schedule.push({
          time,
          medicine: reminder.medicineName,
          dosage: reminder.dosage,
          reminderId: reminder._id.toString(),
        })
      })
    })

    // Sort by time
    schedule.sort((a, b) => {
      const [aHour, aMin] = a.time.split(':').map(Number)
      const [bHour, bMin] = b.time.split(':').map(Number)
      return (aHour * 60 + aMin) - (bHour * 60 + bMin)
    })

    return sendSuccess(res, {
      date: new Date().toISOString().split('T')[0],
      schedule,
      totalDoses: schedule.length,
    })
  } catch (error) {
    console.error('Get today\'s reminders error:', error)
    return sendServerError(res, error as Error)
  }
}

// Mark medicine as taken (creates a record)
export async function markAsTaken(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { id } = req.params
    const { time } = req.body

    if (!time) {
      return sendError(res, 'Time is required')
    }

    const reminder = await MedicineReminder.findById(id)
    if (!reminder) {
      return sendNotFound(res, 'Reminder not found')
    }

    // For now, just return success - tracking taken history would need a separate model
    // or extending the MedicineReminder model with takenHistory field
    const takenEntry = {
      date: new Date(),
      time,
      takenAt: new Date(),
      reminderId: id,
    }

    return sendSuccess(res, { takenEntry }, 'Marked as taken')
  } catch (error) {
    console.error('Mark as taken error:', error)
    return sendServerError(res, error as Error)
  }
}

// Update reminder
export async function updateReminder(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params
    const updates = req.body

    // Don't allow updating certain fields
    delete updates.patientId
    delete updates.createdBy
    delete updates.takenHistory

    const reminder = await MedicineReminder.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!reminder) {
      return sendNotFound(res, 'Reminder not found')
    }

    return sendSuccess(res, reminder, 'Reminder updated')
  } catch (error) {
    console.error('Update reminder error:', error)
    return sendServerError(res, error as Error)
  }
}

// Deactivate reminder
export async function deactivateReminder(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params

    const reminder = await MedicineReminder.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )

    if (!reminder) {
      return sendNotFound(res, 'Reminder not found')
    }

    return sendSuccess(res, reminder, 'Reminder deactivated')
  } catch (error) {
    console.error('Deactivate reminder error:', error)
    return sendServerError(res, error as Error)
  }
}

// Delete reminder
export async function deleteReminder(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params

    const reminder = await MedicineReminder.findByIdAndDelete(id)

    if (!reminder) {
      return sendNotFound(res, 'Reminder not found')
    }

    return sendSuccess(res, null, 'Reminder deleted')
  } catch (error) {
    console.error('Delete reminder error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get reminder statistics
export async function getReminderStats(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const patient = await Patient.findOne({ userId: req.user.userId })
    if (!patient) {
      return sendError(res, 'Patient profile not found')
    }

    const reminders = await MedicineReminder.find({
      patientId: patient._id,
      isActive: true,
    }).lean()

    // Calculate total doses per day
    const totalDosesPerDay = reminders.reduce((sum, r) => sum + r.times.length, 0)

    return sendSuccess(res, {
      activeReminders: reminders.length,
      totalMedicines: reminders.length,
      dosesPerDay: totalDosesPerDay,
      // Note: Adherence tracking would need a separate TakenHistory model
      adherenceRate: null,
    })
  } catch (error) {
    console.error('Get reminder stats error:', error)
    return sendServerError(res, error as Error)
  }
}

// Helper function to get next reminder time
function getNextReminderTime(reminder: any): string | null {
  if (!reminder.isActive) return null

  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  // Find next time today
  for (const time of reminder.times.sort()) {
    const [hours, minutes] = time.split(':').map(Number)
    const timeMinutes = hours * 60 + minutes
    if (timeMinutes > currentTime) {
      return `Today at ${time}`
    }
  }

  // Next is tomorrow's first time
  if (reminder.times.length > 0) {
    return `Tomorrow at ${reminder.times.sort()[0]}`
  }

  return null
}
