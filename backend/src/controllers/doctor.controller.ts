import { Request, Response } from 'express'
import { Doctor, User, Appointment, Patient } from '../models'
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendServerError,
} from '../utils/response.utils'
import { AuthRequest } from '../types'

// List all doctors
export async function listDoctors(req: Request, res: Response): Promise<Response> {
  try {
    const {
      page = 1,
      limit = 20,
      specialization,
      available,
      search,
      district,
    } = req.query

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(50, Math.max(1, Number(limit)))
    const skip = (pageNum - 1) * limitNum

    // Build query
    const query: any = { isVerified: true }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' }
    }

    if (available === 'true') {
      query.isAvailable = true
    }

    // Get doctors with user info
    let doctors = await Doctor.find(query)
      .populate('userId', 'firstName lastName email phone isActive')
      .populate('facilityId', 'name address.city')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()

    // Apply search filter on populated user fields
    if (search) {
      const searchRegex = new RegExp(search as string, 'i')
      doctors = doctors.filter((d: any) => {
        const user = d.userId
        return (
          searchRegex.test(user?.firstName || '') ||
          searchRegex.test(user?.lastName || '') ||
          searchRegex.test(d.specialization || '') ||
          searchRegex.test(d.qualification || '')
        )
      })
    }

    const total = await Doctor.countDocuments(query)

    return sendSuccess(res, {
      doctors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('List doctors error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get doctor by ID
export async function getDoctorById(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params

    const doctor = await Doctor.findById(id)
      .populate('userId', 'firstName lastName email phone preferredLanguage')
      .populate('facilityId', 'name address contact')
      .lean()

    if (!doctor) {
      return sendNotFound(res, 'Doctor not found')
    }

    return sendSuccess(res, doctor)
  } catch (error) {
    console.error('Get doctor error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get my profile (for logged-in doctor)
export async function getMyDoctorProfile(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const doctor = await Doctor.findOne({ userId: req.user.userId })
      .populate('userId', 'firstName lastName email phone preferredLanguage')
      .populate('facilityId', 'name address contact')
      .lean()

    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found')
    }

    return sendSuccess(res, doctor)
  } catch (error) {
    console.error('Get my doctor profile error:', error)
    return sendServerError(res, error as Error)
  }
}

// Update doctor profile
export async function updateDoctorProfile(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const updates = req.body

    // Restricted fields that only admins can update
    const restrictedFields = ['isVerified', 'rating', 'totalConsultations']
    if (req.user.role !== 'ADMIN') {
      restrictedFields.forEach((field) => delete updates[field])
    }

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName email phone')

    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found')
    }

    return sendSuccess(res, doctor, 'Profile updated successfully')
  } catch (error) {
    console.error('Update doctor profile error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get doctor's available slots
export async function getAvailableSlots(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params
    const { date } = req.query

    const doctor = await Doctor.findById(id)
    if (!doctor) {
      return sendNotFound(res, 'Doctor not found')
    }

    // Get available slots for the day
    const targetDate = date ? new Date(date as string) : new Date()
    const dayOfWeek = targetDate.getDay()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = dayNames[dayOfWeek]
    
    const daySlots = doctor.availability?.filter((slot: any) => slot.day === dayName) || []

    // Get already booked slots for that date
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

    const bookedAppointments = await Appointment.find({
      doctorId: id,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['SCHEDULED', 'CONFIRMED'] },
    }).select('scheduledTime')

    const bookedTimes = bookedAppointments.map((a: any) => a.scheduledTime)

    // Generate available time slots (30-minute intervals)
    const availableSlots: string[] = []
    
    daySlots.forEach((slot: any) => {
      const [startHour, startMin] = slot.startTime.split(':').map(Number)
      const [endHour, endMin] = slot.endTime.split(':').map(Number)
      
      let currentHour = startHour
      let currentMin = startMin

      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
        
        if (!bookedTimes.includes(timeStr)) {
          availableSlots.push(timeStr)
        }

        // Increment by 30 minutes
        currentMin += 30
        if (currentMin >= 60) {
          currentMin = 0
          currentHour++
        }
      }
    })

    return sendSuccess(res, {
      doctorId: id,
      date: date || new Date().toISOString().split('T')[0],
      dayOfWeek: dayName,
      availableSlots,
      consultationFee: doctor.consultationFee,
    })
  } catch (error) {
    console.error('Get available slots error:', error)
    return sendServerError(res, error as Error)
  }
}

// Search doctors
export async function searchDoctors(req: Request, res: Response): Promise<Response> {
  try {
    const { q, limit = 10 } = req.query

    if (!q || (q as string).length < 2) {
      return sendError(res, 'Search query must be at least 2 characters')
    }

    // Search in users first
    const users = await User.find({
      role: 'DOCTOR',
      isActive: true,
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
      ],
    })
      .select('_id firstName lastName')
      .limit(Number(limit))
      .lean()

    const userIds = users.map((u: any) => u._id)

    // Get corresponding doctors
    const doctors = await Doctor.find({
      $or: [
        { userId: { $in: userIds } },
        { specialization: { $regex: q, $options: 'i' } },
      ],
      isVerified: true,
    })
      .populate('userId', 'firstName lastName phone')
      .lean()

    return sendSuccess(res, doctors)
  } catch (error) {
    console.error('Search doctors error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get doctor statistics
export async function getDoctorStats(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const doctor = await Doctor.findOne({ userId: req.user.userId })
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found')
    }

    const today = new Date()
    const startOfToday = new Date(today.setHours(0, 0, 0, 0))
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [
      todayAppointments,
      weekAppointments,
      monthAppointments,
      totalPatients,
      pendingAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({
        doctorId: doctor._id,
        scheduledDate: { $gte: startOfToday },
        status: { $in: ['SCHEDULED', 'CONFIRMED'] },
      }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        scheduledDate: { $gte: startOfWeek },
      }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        scheduledDate: { $gte: startOfMonth },
      }),
      Appointment.distinct('patientId', { doctorId: doctor._id }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        status: 'SCHEDULED',
      }),
    ])

    // Get high-risk patients count
    const highRiskPatients = await Patient.countDocuments({
      _id: { $in: totalPatients },
      riskLevel: { $in: ['HIGH', 'CRITICAL'] },
    })

    return sendSuccess(res, {
      todayAppointments,
      weekAppointments,
      monthAppointments,
      totalPatients: totalPatients.length,
      pendingAppointments,
      highRiskPatients,
      rating: doctor.rating,
      totalConsultations: doctor.totalConsultations,
    })
  } catch (error) {
    console.error('Get doctor stats error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get specializations list
export async function getSpecializations(req: Request, res: Response): Promise<Response> {
  try {
    const specializations = await Doctor.distinct('specialization', { isVerified: true })
    return sendSuccess(res, specializations.sort())
  } catch (error) {
    console.error('Get specializations error:', error)
    return sendServerError(res, error as Error)
  }
}

// Update availability status
export async function updateAvailability(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { teleconsultationEnabled } = req.body

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.userId },
      { teleconsultationEnabled },
      { new: true }
    )

    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found')
    }

    return sendSuccess(res, { teleconsultationEnabled: doctor.teleconsultationEnabled }, 'Availability updated')
  } catch (error) {
    console.error('Update availability error:', error)
    return sendServerError(res, error as Error)
  }
}
