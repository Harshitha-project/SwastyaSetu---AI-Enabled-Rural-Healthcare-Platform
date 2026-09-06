import { Response } from 'express'
import { Appointment, Doctor, Patient, User, Notification } from '../models'
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendServerError,
} from '../utils/response.utils'
import { AuthRequest } from '../types'

// Create new appointment
export async function createAppointment(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { doctorId, patientId, scheduledDate, scheduledTime, type, reason, notes } = req.body

    // Determine patient ID
    let actualPatientId = patientId

    // If user is a patient, they can only book for themselves
    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId })
      if (!patient) {
        return sendError(res, 'Patient profile not found')
      }
      actualPatientId = patient._id.toString()
    }

    // Validate doctor exists and is available
    const doctor = await Doctor.findById(doctorId).populate('userId', 'firstName lastName')
    if (!doctor) {
      return sendNotFound(res, 'Doctor not found')
    }

    if (doctor.teleconsultationEnabled === false) {
      return sendError(res, 'Doctor is currently not available for appointments')
    }

    // Check for scheduling conflicts
    const appointmentDate = new Date(scheduledDate)
    const startOfDay = new Date(appointmentDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(appointmentDate.setHours(23, 59, 59, 999))

    const existingAppointment = await Appointment.findOne({
      doctorId,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      scheduledTime,
      status: { $in: ['SCHEDULED', 'CONFIRMED'] },
    })

    if (existingAppointment) {
      return sendError(res, 'This time slot is already booked. Please choose another time.')
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctorId,
      patientId: actualPatientId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      type: type || 'CONSULTATION',
      reason,
      notes,
      status: 'SCHEDULED',
      bookedBy: req.user.userId,
    })

    // Populate for response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName phone' },
      })

    // Create notification for doctor
    const patient = await Patient.findById(actualPatientId).populate('userId', 'firstName lastName')
    await Notification.create({
      userId: doctor.userId,
      type: 'APPOINTMENT',
      title: 'New Appointment Booked',
      message: `New appointment scheduled with ${(patient?.userId as any)?.firstName || 'a patient'} on ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}`,
      data: { appointmentId: appointment._id },
    })

    return sendCreated(res, populatedAppointment, 'Appointment booked successfully')
  } catch (error) {
    console.error('Create appointment error:', error)
    return sendServerError(res, error as Error)
  }
}

// List appointments
export async function listAppointments(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const {
      page = 1,
      limit = 20,
      status,
      type,
      fromDate,
      toDate,
      doctorId,
      patientId,
    } = req.query

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(50, Number(limit))
    const skip = (pageNum - 1) * limitNum

    // Build query based on role
    const query: any = {}

    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId })
      if (!patient) {
        return sendError(res, 'Patient profile not found')
      }
      query.patientId = patient._id
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: req.user.userId })
      if (!doctor) {
        return sendError(res, 'Doctor profile not found')
      }
      query.doctorId = doctor._id
    } else if (req.user.role === 'HEALTH_WORKER') {
      // Health workers see appointments for their assigned patients
      const assignedPatients = await Patient.find({ assignedHealthWorker: req.user.userId }).select('_id')
      query.patientId = { $in: assignedPatients.map((p: any) => p._id) }
    }

    // Apply filters
    if (status) {
      query.status = status
    }

    if (type) {
      query.type = type
    }

    if (fromDate) {
      query.scheduledDate = { ...query.scheduledDate, $gte: new Date(fromDate as string) }
    }

    if (toDate) {
      query.scheduledDate = { ...query.scheduledDate, $lte: new Date(toDate as string) }
    }

    // Admin can filter by specific doctor or patient
    if (req.user.role === 'ADMIN') {
      if (doctorId) query.doctorId = doctorId
      if (patientId) query.patientId = patientId
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'firstName lastName' },
          select: 'specialization qualification',
        })
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'firstName lastName phone' },
        })
        .sort({ scheduledDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Appointment.countDocuments(query),
    ])

    return sendSuccess(res, {
      appointments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('List appointments error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get upcoming appointments
export async function getUpcomingAppointments(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { limit = 5 } = req.query

    const query: any = {
      scheduledDate: { $gte: new Date() },
      status: { $in: ['SCHEDULED', 'CONFIRMED'] },
    }

    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId })
      if (!patient) {
        return sendError(res, 'Patient profile not found')
      }
      query.patientId = patient._id
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: req.user.userId })
      if (!doctor) {
        return sendError(res, 'Doctor profile not found')
      }
      query.doctorId = doctor._id
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'firstName lastName' },
        select: 'specialization',
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName phone' },
      })
      .sort({ scheduledDate: 1 })
      .limit(Number(limit))
      .lean()

    return sendSuccess(res, appointments)
  } catch (error) {
    console.error('Get upcoming appointments error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get appointment by ID
export async function getAppointmentById(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params

    const appointment = await Appointment.findById(id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .lean()

    if (!appointment) {
      return sendNotFound(res, 'Appointment not found')
    }

    return sendSuccess(res, appointment)
  } catch (error) {
    console.error('Get appointment error:', error)
    return sendServerError(res, error as Error)
  }
}

// Update appointment
export async function updateAppointment(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params
    const updates = req.body

    const appointment = await Appointment.findById(id)
    if (!appointment) {
      return sendNotFound(res, 'Appointment not found')
    }

    // Only allow updates if not completed or cancelled
    if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status)) {
      return sendError(res, 'Cannot update a completed or cancelled appointment')
    }

    // Restricted fields
    const allowedUpdates = ['scheduledDate', 'scheduledTime', 'type', 'reason', 'notes']
    const filteredUpdates: any = {}
    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field]
      }
    })

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    )
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })

    return sendSuccess(res, updatedAppointment, 'Appointment updated successfully')
  } catch (error) {
    console.error('Update appointment error:', error)
    return sendServerError(res, error as Error)
  }
}

// Update appointment status
export async function updateAppointmentStatus(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params
    const { status, cancellationReason } = req.body

    const validStatuses = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
    if (!validStatuses.includes(status)) {
      return sendError(res, 'Invalid status')
    }

    const appointment = await Appointment.findById(id)
    if (!appointment) {
      return sendNotFound(res, 'Appointment not found')
    }

    const updateData: any = { status }

    if (status === 'CANCELLED' && cancellationReason) {
      updateData.cancelReason = cancellationReason
    }

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date()
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })

    // Create notification
    const patient = await Patient.findById(appointment.patientId).populate('userId')
    if (patient && status !== appointment.status) {
      await Notification.create({
        userId: (patient.userId as any)._id,
        type: 'APPOINTMENT',
        title: `Appointment ${status.toLowerCase()}`,
        message: `Your appointment has been ${status.toLowerCase()}.`,
        data: { appointmentId: id },
      })
    }

    return sendSuccess(res, updatedAppointment, `Appointment ${status.toLowerCase()} successfully`)
  } catch (error) {
    console.error('Update status error:', error)
    return sendServerError(res, error as Error)
  }
}

// Cancel appointment
export async function cancelAppointment(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params
    const { reason } = req.body

    const appointment = await Appointment.findById(id)
    if (!appointment) {
      return sendNotFound(res, 'Appointment not found')
    }

    if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
      return sendError(res, 'Cannot cancel this appointment')
    }

    appointment.status = 'CANCELLED'
    appointment.cancelReason = reason || 'Cancelled by user'
    await appointment.save()

    return sendSuccess(res, appointment, 'Appointment cancelled successfully')
  } catch (error) {
    console.error('Cancel appointment error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get today's appointments (for doctors)
export async function getTodaysAppointments(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const query: any = {
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
    }

    if (req.user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: req.user.userId })
      if (!doctor) {
        return sendError(res, 'Doctor profile not found')
      }
      query.doctorId = doctor._id
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName phone' },
      })
      .sort({ scheduledTime: 1 })
      .lean()

    return sendSuccess(res, appointments)
  } catch (error) {
    console.error('Get today\'s appointments error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get appointment statistics
export async function getAppointmentStats(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const query: any = {}

    if (req.user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: req.user.userId })
      if (doctor) {
        query.doctorId = doctor._id
      }
    }

    const today = new Date()
    const startOfToday = new Date(today.setHours(0, 0, 0, 0))
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [todayCount, weekCount, monthCount, statusStats] = await Promise.all([
      Appointment.countDocuments({ ...query, scheduledDate: { $gte: startOfToday } }),
      Appointment.countDocuments({ ...query, scheduledDate: { $gte: startOfWeek } }),
      Appointment.countDocuments({ ...query, scheduledDate: { $gte: startOfMonth } }),
      Appointment.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ])

    return sendSuccess(res, {
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      byStatus: statusStats.reduce((acc: any, curr: any) => {
        acc[curr._id] = curr.count
        return acc
      }, {}),
    })
  } catch (error) {
    console.error('Get appointment stats error:', error)
    return sendServerError(res, error as Error)
  }
}
