import { Request, Response } from 'express'
import { User, Patient, HealthMetric, Appointment, AIAssessment, MedicalRecord } from '../models'
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendServerError,
} from '../utils/response.utils'
import { AuthRequest } from '../types'

// List patients (for doctors, health workers, admins)
export async function listPatients(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      district,
      riskLevel,
      assignedTo,
    } = req.query

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(50, Math.max(1, Number(limit)))
    const skip = (pageNum - 1) * limitNum

    // Build patient query
    const patientQuery: any = {}

    if (district) {
      patientQuery['address.district'] = { $regex: district, $options: 'i' }
    }

    if (riskLevel) {
      patientQuery.riskLevel = riskLevel
    }

    // For health workers, only show assigned patients
    if (req.user?.role === 'HEALTH_WORKER' && !assignedTo) {
      patientQuery.assignedHealthWorker = req.user.userId
    } else if (assignedTo) {
      patientQuery.assignedHealthWorker = assignedTo
    }

    // Get patients with user info
    let patients = await Patient.find(patientQuery)
      .populate('userId', 'firstName lastName email phone isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()

    // Apply search filter on populated user fields
    if (search) {
      const searchRegex = new RegExp(search as string, 'i')
      patients = patients.filter((p: any) => {
        const user = p.userId
        return (
          searchRegex.test(user?.firstName || '') ||
          searchRegex.test(user?.lastName || '') ||
          searchRegex.test(user?.phone || '') ||
          searchRegex.test(user?.email || '')
        )
      })
    }

    const total = await Patient.countDocuments(patientQuery)

    return sendSuccess(res, {
      patients,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('List patients error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get patient by ID
export async function getPatientById(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params

    // Allow patients to view their own profile
    const patient = await Patient.findById(id)
      .populate('userId', 'firstName lastName email phone preferredLanguage isActive createdAt')
      .populate('assignedHealthWorker', 'firstName lastName')
      .lean()

    if (!patient) {
      return sendNotFound(res, 'Patient not found')
    }

    // Check authorization - patients can only view their own
    if (req.user?.role === 'PATIENT') {
      const patientUserId = (patient as any).userId?._id?.toString()
      if (patientUserId !== req.user.userId) {
        return sendUnauthorized(res, 'You can only view your own profile')
      }
    }

    return sendSuccess(res, patient)
  } catch (error) {
    console.error('Get patient error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get patient profile by user ID (for logged-in patient)
export async function getMyProfile(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const patient = await Patient.findOne({ userId: req.user.userId })
      .populate('userId', 'firstName lastName email phone preferredLanguage')
      .lean()

    if (!patient) {
      return sendNotFound(res, 'Patient profile not found')
    }

    return sendSuccess(res, patient)
  } catch (error) {
    console.error('Get my profile error:', error)
    return sendServerError(res, error as Error)
  }
}

// Update patient profile
export async function updatePatient(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params
    const updates = req.body

    // Check authorization
    const patient = await Patient.findById(id)
    if (!patient) {
      return sendNotFound(res, 'Patient not found')
    }

    // Patients can only update their own profile
    if (req.user?.role === 'PATIENT' && patient.userId.toString() !== req.user.userId) {
      return sendUnauthorized(res, 'You can only update your own profile')
    }

    // Restricted fields that only admins can update
    const restrictedFields = ['riskLevel', 'assignedHealthWorker']
    if (req.user?.role !== 'ADMIN') {
      restrictedFields.forEach((field) => delete updates[field])
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email phone')

    return sendSuccess(res, updatedPatient, 'Profile updated successfully')
  } catch (error) {
    console.error('Update patient error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get patient health summary
export async function getHealthSummary(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params

    const patient = await Patient.findById(id)
    if (!patient) {
      return sendNotFound(res, 'Patient not found')
    }

    // Get latest vitals
    const latestVitals = await HealthMetric.findOne({ patientId: id })
      .sort({ recordedAt: -1 })
      .lean()

    // Get vitals trend (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const vitalsTrend = await HealthMetric.find({
      patientId: id,
      recordedAt: { $gte: thirtyDaysAgo },
    })
      .sort({ recordedAt: 1 })
      .lean()

    // Get recent AI assessments
    const recentAssessments = await AIAssessment.find({ patientId: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patientId: id,
      scheduledDate: { $gte: new Date() },
      status: { $in: ['SCHEDULED', 'CONFIRMED'] },
    })
      .sort({ scheduledDate: 1 })
      .limit(3)
      .populate('doctorId', 'specialization')
      .lean()

    // Calculate health score based on various factors
    const healthScore = calculateHealthScore(latestVitals, patient.riskLevel)

    return sendSuccess(res, {
      patient: {
        id: patient._id,
        bloodGroup: patient.bloodGroup,
        riskLevel: patient.riskLevel,
        allergies: patient.allergies,
        chronicConditions: patient.medicalHistory,
      },
      latestVitals,
      vitalsTrend,
      recentAssessments,
      upcomingAppointments,
      healthScore,
    })
  } catch (error) {
    console.error('Get health summary error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get patient medical timeline
export async function getMedicalTimeline(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params
    const { page = 1, limit = 20 } = req.query

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(50, Number(limit))
    const skip = (pageNum - 1) * limitNum

    // Gather all events
    const [appointments, assessments, records] = await Promise.all([
      Appointment.find({ patientId: id, status: 'COMPLETED' })
        .populate('doctorId', 'specialization')
        .lean(),
      AIAssessment.find({ patientId: id }).lean(),
      MedicalRecord.find({ patientId: id }).lean(),
    ])

    // Combine and format as timeline events
    const timeline = [
      ...appointments.map((a: any) => ({
        type: 'APPOINTMENT',
        date: a.scheduledDate,
        title: `Consultation with ${a.doctorId?.specialization || 'Doctor'}`,
        details: a.notes || 'Completed appointment',
        data: a,
      })),
      ...assessments.map((a: any) => ({
        type: 'AI_ASSESSMENT',
        date: a.createdAt,
        title: `Health Assessment - ${a.riskLevel} Risk`,
        details: `Risk Score: ${a.riskScore}%`,
        data: a,
      })),
      ...records.map((r: any) => ({
        type: 'MEDICAL_RECORD',
        date: r.date,
        title: r.type,
        details: r.diagnosis || r.description,
        data: r,
      })),
    ]

    // Sort by date descending and paginate
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const paginatedTimeline = timeline.slice(skip, skip + limitNum)

    return sendSuccess(res, {
      timeline: paginatedTimeline,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: timeline.length,
        pages: Math.ceil(timeline.length / limitNum),
      },
    })
  } catch (error) {
    console.error('Get timeline error:', error)
    return sendServerError(res, error as Error)
  }
}

// Search patients
export async function searchPatients(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { q, limit = 10 } = req.query

    if (!q || (q as string).length < 2) {
      return sendError(res, 'Search query must be at least 2 characters')
    }

    // Search in users first
    const users = await User.find({
      role: 'PATIENT',
      isActive: true,
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    })
      .select('_id firstName lastName phone email')
      .limit(Number(limit))
      .lean()

    const userIds = users.map((u: any) => u._id)

    // Get corresponding patients
    const patients = await Patient.find({ userId: { $in: userIds } })
      .populate('userId', 'firstName lastName phone email')
      .lean()

    return sendSuccess(res, patients)
  } catch (error) {
    console.error('Search patients error:', error)
    return sendServerError(res, error as Error)
  }
}

// List high-risk patients
export async function getHighRiskPatients(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { page = 1, limit = 20, district } = req.query

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(50, Number(limit))
    const skip = (pageNum - 1) * limitNum

    const query: any = { riskLevel: { $in: ['HIGH', 'CRITICAL'] } }

    if (district) {
      query['address.district'] = { $regex: district, $options: 'i' }
    }

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .populate('userId', 'firstName lastName phone')
        .populate('assignedHealthWorker', 'firstName lastName')
        .sort({ riskLevel: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Patient.countDocuments(query),
    ])

    return sendSuccess(res, {
      patients,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('Get high-risk patients error:', error)
    return sendServerError(res, error as Error)
  }
}

// Helper: Calculate health score
function calculateHealthScore(vitals: any, riskLevel: string): number {
  let score = 100

  // Deduct based on risk level
  if (riskLevel === 'CRITICAL') score -= 40
  else if (riskLevel === 'HIGH') score -= 25
  else if (riskLevel === 'MODERATE') score -= 10

  if (vitals) {
    // Check heart rate
    if (vitals.heartRate < 60 || vitals.heartRate > 100) score -= 5

    // Check blood pressure
    if (vitals.bloodPressure) {
      if (vitals.bloodPressure.systolic > 140 || vitals.bloodPressure.diastolic > 90) score -= 10
      if (vitals.bloodPressure.systolic > 180 || vitals.bloodPressure.diastolic > 120) score -= 15
    }

    // Check oxygen
    if (vitals.oxygenSaturation < 95) score -= 10
    if (vitals.oxygenSaturation < 90) score -= 20

    // Check temperature
    if (vitals.temperature > 100.4 || vitals.temperature < 97) score -= 5
  }

  return Math.max(0, Math.min(100, score))
}
