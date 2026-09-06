import { Response } from 'express'
import { HealthWorker, User, Patient } from '../models'
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendServerError,
} from '../utils/response.utils'
import { AuthRequest } from '../types'

// Get my profile (for health workers)
export async function getMyProfile(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const worker = await HealthWorker.findOne({ userId: req.user.userId })
      .populate('userId', 'firstName lastName email phone preferredLanguage')
      .populate('facilityId', 'name address')
      .lean()

    if (!worker) {
      return sendNotFound(res, 'Health worker profile not found')
    }

    return sendSuccess(res, worker)
  } catch (error) {
    console.error('Get my profile error:', error)
    return sendServerError(res, error as Error)
  }
}

// Update my profile
export async function updateMyProfile(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const updates = req.body

    // Restricted fields
    delete updates.employeeId
    delete updates.userId
    delete updates.isActive

    const worker = await HealthWorker.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email phone')

    if (!worker) {
      return sendNotFound(res, 'Health worker profile not found')
    }

    return sendSuccess(res, worker, 'Profile updated')
  } catch (error) {
    console.error('Update profile error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get assigned patients
export async function getAssignedPatients(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { page = 1, limit = 20, riskLevel, search } = req.query
    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(50, Number(limit))
    const skip = (pageNum - 1) * limitNum

    const query: any = { assignedWorkerId: req.user.userId }

    if (riskLevel) {
      query.riskLevel = riskLevel
    }

    let patients = await Patient.find(query)
      .populate('userId', 'firstName lastName phone email')
      .sort({ riskLevel: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()

    // Apply search filter
    if (search) {
      const searchRegex = new RegExp(search as string, 'i')
      patients = patients.filter((p: any) => {
        const user = p.userId
        return (
          searchRegex.test(user?.firstName || '') ||
          searchRegex.test(user?.lastName || '') ||
          searchRegex.test(user?.phone || '')
        )
      })
    }

    const total = await Patient.countDocuments(query)

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
    console.error('Get assigned patients error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get dashboard stats
export async function getDashboardStats(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const [
      totalAssigned,
      highRiskCount,
      moderateRiskCount,
      lowRiskCount,
    ] = await Promise.all([
      Patient.countDocuments({ assignedWorkerId: req.user.userId }),
      Patient.countDocuments({ assignedWorkerId: req.user.userId, riskLevel: 'HIGH' }),
      Patient.countDocuments({ assignedWorkerId: req.user.userId, riskLevel: 'MODERATE' }),
      Patient.countDocuments({ assignedWorkerId: req.user.userId, riskLevel: 'LOW' }),
    ])

    return sendSuccess(res, {
      totalAssigned,
      riskDistribution: {
        high: highRiskCount,
        moderate: moderateRiskCount,
        low: lowRiskCount,
      },
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return sendServerError(res, error as Error)
  }
}

// List all health workers (admin)
export async function listHealthWorkers(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { page = 1, limit = 20, district, designation, search } = req.query
    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(50, Number(limit))
    const skip = (pageNum - 1) * limitNum

    const query: any = { isActive: true }

    if (district) {
      query['assignedArea.district'] = { $regex: district, $options: 'i' }
    }

    if (designation) {
      query.designation = designation
    }

    let workers = await HealthWorker.find(query)
      .populate('userId', 'firstName lastName phone email isActive')
      .populate('facilityId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()

    // Apply search filter
    if (search) {
      const searchRegex = new RegExp(search as string, 'i')
      workers = workers.filter((w: any) => {
        const user = w.userId
        return (
          searchRegex.test(user?.firstName || '') ||
          searchRegex.test(user?.lastName || '') ||
          searchRegex.test(w.employeeId || '')
        )
      })
    }

    const total = await HealthWorker.countDocuments(query)

    return sendSuccess(res, {
      workers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('List health workers error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get health worker by ID
export async function getHealthWorkerById(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params

    const worker = await HealthWorker.findById(id)
      .populate('userId', 'firstName lastName phone email')
      .populate('facilityId', 'name address')
      .lean()

    if (!worker) {
      return sendNotFound(res, 'Health worker not found')
    }

    // Get assigned patients count
    const assignedCount = await Patient.countDocuments({ assignedWorkerId: (worker.userId as any)?._id })

    return sendSuccess(res, {
      ...worker,
      assignedPatientsCount: assignedCount,
    })
  } catch (error) {
    console.error('Get health worker error:', error)
    return sendServerError(res, error as Error)
  }
}

// Assign patient to health worker
export async function assignPatient(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { patientId, workerId } = req.body

    if (!patientId || !workerId) {
      return sendError(res, 'patientId and workerId are required')
    }

    // Verify worker exists
    const worker = await HealthWorker.findById(workerId)
    if (!worker) {
      return sendNotFound(res, 'Health worker not found')
    }

    // Update patient
    const patient = await Patient.findByIdAndUpdate(
      patientId,
      { assignedWorkerId: worker.userId },
      { new: true }
    ).populate('userId', 'firstName lastName')

    if (!patient) {
      return sendNotFound(res, 'Patient not found')
    }

    return sendSuccess(res, patient, 'Patient assigned successfully')
  } catch (error) {
    console.error('Assign patient error:', error)
    return sendServerError(res, error as Error)
  }
}
