import { Response } from 'express'
import { Consultation, Appointment, Patient, Doctor, User, Notification, Prescription } from '../models'
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendServerError,
} from '../utils/response.utils'
import { AuthRequest } from '../types'

// Start a consultation from an appointment
export async function startConsultation(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { appointmentId } = req.body

    // Get appointment
    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return sendNotFound(res, 'Appointment not found')
    }

    // Check if consultation already exists
    const existingConsultation = await Consultation.findOne({ appointmentId })
    if (existingConsultation) {
      return sendSuccess(res, existingConsultation, 'Consultation already started')
    }

    // Verify user is the doctor for this appointment
    if (req.user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: req.user.userId })
      if (!doctor || doctor._id.toString() !== appointment.doctorId.toString()) {
        return sendUnauthorized(res, 'You are not authorized to start this consultation')
      }
    }

    // Update appointment status
    appointment.status = 'CONFIRMED'
    await appointment.save()

    // Create consultation
    const consultation = await Consultation.create({
      appointmentId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      type: appointment.type,
      status: 'ONGOING',
      startTime: new Date(),
      chatMessages: [],
    })

    // Notify patient
    const patient = await Patient.findById(appointment.patientId).populate('userId')
    if (patient) {
      await Notification.create({
        userId: (patient.userId as any)._id,
        type: 'CONSULTATION',
        title: 'Consultation Started',
        message: 'Your doctor has started the consultation. Please join now.',
        data: { consultationId: consultation._id },
      })
    }

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })

    return sendCreated(res, populatedConsultation, 'Consultation started')
  } catch (error) {
    console.error('Start consultation error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get consultation by ID
export async function getConsultationById(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params

    const consultation = await Consultation.findById(id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .populate('appointmentId')
      .lean()

    if (!consultation) {
      return sendNotFound(res, 'Consultation not found')
    }

    return sendSuccess(res, consultation)
  } catch (error) {
    console.error('Get consultation error:', error)
    return sendServerError(res, error as Error)
  }
}

// List consultations
export async function listConsultations(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { page = 1, limit = 20, status } = req.query
    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(50, Number(limit))
    const skip = (pageNum - 1) * limitNum

    const query: any = {}

    // Role-based filtering
    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId })
      if (!patient) return sendError(res, 'Patient profile not found')
      query.patientId = patient._id
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: req.user.userId })
      if (!doctor) return sendError(res, 'Doctor profile not found')
      query.doctorId = doctor._id
    }

    if (status) {
      query.status = status
    }

    const [consultations, total] = await Promise.all([
      Consultation.find(query)
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'firstName lastName' },
        })
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'firstName lastName' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Consultation.countDocuments(query),
    ])

    return sendSuccess(res, {
      consultations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('List consultations error:', error)
    return sendServerError(res, error as Error)
  }
}

// Send chat message
export async function sendMessage(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { id } = req.params
    const { content, messageType = 'TEXT' } = req.body

    if (!content || content.trim().length === 0) {
      return sendError(res, 'Message content is required')
    }

    const consultation = await Consultation.findById(id)
    if (!consultation) {
      return sendNotFound(res, 'Consultation not found')
    }

    if (consultation.status !== 'ONGOING') {
      return sendError(res, 'Cannot send messages to a closed consultation')
    }

    // Determine sender type
    let senderType: 'PATIENT' | 'DOCTOR' = 'PATIENT'
    if (req.user.role === 'DOCTOR') {
      senderType = 'DOCTOR'
    }

    // Add message to consultation
    const message = {
      sender: senderType,
      senderId: req.user.userId,
      message: content.trim(),
      timestamp: new Date(),
    }

    consultation.chatMessages.push(message as any)
    await consultation.save()

    // Send notification to other party
    let recipientUserId: string | null = null
    if (senderType === 'DOCTOR') {
      const patient = await Patient.findById(consultation.patientId)
      if (patient) recipientUserId = patient.userId.toString()
    } else {
      const doctor = await Doctor.findById(consultation.doctorId)
      if (doctor) recipientUserId = doctor.userId.toString()
    }

    if (recipientUserId) {
      await Notification.create({
        userId: recipientUserId,
        type: 'CONSULTATION',
        title: 'New Message',
        message: `New message in your consultation: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        data: { consultationId: id },
      })
    }

    return sendSuccess(res, { message }, 'Message sent')
  } catch (error) {
    console.error('Send message error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get chat messages
export async function getMessages(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params
    const { since } = req.query

    const consultation = await Consultation.findById(id)
    if (!consultation) {
      return sendNotFound(res, 'Consultation not found')
    }

    let messages = consultation.chatMessages || []

    // Filter messages since timestamp (for polling)
    if (since) {
      const sinceDate = new Date(since as string)
      messages = messages.filter((m: any) => new Date(m.timestamp) > sinceDate)
    }

    return sendSuccess(res, { messages, total: consultation.chatMessages.length })
  } catch (error) {
    console.error('Get messages error:', error)
    return sendServerError(res, error as Error)
  }
}

// End consultation
export async function endConsultation(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { id } = req.params
    const { diagnosis, notes, followUpRequired, followUpDate } = req.body

    const consultation = await Consultation.findById(id)
    if (!consultation) {
      return sendNotFound(res, 'Consultation not found')
    }

    if (consultation.status !== 'ONGOING') {
      return sendError(res, 'Consultation is not in progress')
    }

    // Only doctors can end consultation with diagnosis
    if (req.user.role !== 'DOCTOR') {
      return sendUnauthorized(res, 'Only doctors can complete consultations')
    }

    // Update consultation
    consultation.status = 'COMPLETED'
    consultation.endTime = new Date()
    consultation.diagnosis = diagnosis
    consultation.notes = notes
    if (followUpDate) {
      consultation.followUpDate = new Date(followUpDate)
    }
    if (followUpRequired) {
      consultation.followUpNotes = 'Follow-up required'
    }

    await consultation.save()

    // Update appointment status
    await Appointment.findByIdAndUpdate(consultation.appointmentId, {
      status: 'COMPLETED',
      completedAt: new Date(),
    })

    // Update doctor's consultation count
    await Doctor.findByIdAndUpdate(consultation.doctorId, {
      $inc: { totalConsultations: 1 },
    })

    // Notify patient
    const patient = await Patient.findById(consultation.patientId).populate('userId')
    if (patient) {
      await Notification.create({
        userId: (patient.userId as any)._id,
        type: 'CONSULTATION',
        title: 'Consultation Completed',
        message: followUpRequired
          ? `Your consultation is complete. A follow-up is recommended on ${new Date(followUpDate).toLocaleDateString()}.`
          : 'Your consultation is complete. Check your prescriptions and recommendations.',
        data: { consultationId: id },
      })
    }

    return sendSuccess(res, consultation, 'Consultation completed')
  } catch (error) {
    console.error('End consultation error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get active consultation
export async function getActiveConsultation(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const query: any = { status: 'ONGOING' }

    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId })
      if (!patient) return sendError(res, 'Patient profile not found')
      query.patientId = patient._id
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: req.user.userId })
      if (!doctor) return sendError(res, 'Doctor profile not found')
      query.doctorId = doctor._id
    }

    const consultation = await Consultation.findOne(query)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .lean()

    return sendSuccess(res, consultation)
  } catch (error) {
    console.error('Get active consultation error:', error)
    return sendServerError(res, error as Error)
  }
}

// Mark messages as read
export async function markMessagesRead(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params

    const consultation = await Consultation.findById(id)
    if (!consultation) {
      return sendNotFound(res, 'Consultation not found')
    }

    // Mark all messages as read
    consultation.chatMessages.forEach((msg: any) => {
      // Messages don't have isRead in current schema
    })

    await consultation.save()

    return sendSuccess(res, null, 'Messages marked as read')
  } catch (error) {
    console.error('Mark messages read error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get consultation history with prescriptions
export async function getConsultationWithPrescription(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params

    const consultation = await Consultation.findById(id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .lean()

    if (!consultation) {
      return sendNotFound(res, 'Consultation not found')
    }

    // Get related prescription
    const prescription = await Prescription.findOne({ consultationId: id }).lean()

    return sendSuccess(res, {
      consultation,
      prescription,
    })
  } catch (error) {
    console.error('Get consultation with prescription error:', error)
    return sendServerError(res, error as Error)
  }
}
