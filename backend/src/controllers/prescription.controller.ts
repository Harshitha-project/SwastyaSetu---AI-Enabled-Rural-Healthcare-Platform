import { Request, Response } from 'express'
import { prisma } from '../config/database'
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendServerError,
} from '../utils/response.utils'
import { AuthRequest } from '../types'

/**
 * Prescription Controller
 * Handles all prescription-related operations
 */
export class PrescriptionController {
  /**
   * Create a new prescription
   * POST /api/prescriptions
   */
  async createPrescription(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const doctorUserId = req.user?.userId

      // Get doctor info
      const doctor = await prisma.doctor.findFirst({
        where: { userId: doctorUserId },
        include: {
          user: true,
          facility: true,
        },
      })

      if (!doctor) {
        return sendError(res, 'Doctor profile not found', 404)
      }

      const {
        patientId,
        consultationId,
        diagnosis,
        symptoms,
        medications,
        advice,
        followUpDate,
        vitals,
      } = req.body

      // Validate patient exists
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: { user: true },
      })

      if (!patient) {
        return sendError(res, 'Patient not found', 404)
      }

      // Generate prescription number
      const prescriptionNumber = generatePrescriptionNumber()

      // Calculate validity (30 days from now)
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + 30)

      // Create prescription
      const prescription = await prisma.prescription.create({
        data: {
          patientId,
          doctorId: doctor.id,
          consultationId: consultationId || null,
          medications: medications, // Stored as JSON
          instructions: advice,
          validUntil: followUpDate ? new Date(followUpDate) : validUntil,
        },
        include: {
          patient: {
            include: { user: true },
          },
          doctor: {
            include: { user: true, facility: true },
          },
          consultation: true,
        },
      })

      // Format response to match frontend Prescription interface
      const formattedPrescription = formatPrescription(prescription, {
        diagnosis,
        symptoms,
        vitals,
        prescriptionNumber,
      })

      return sendCreated(res, formattedPrescription, 'Prescription created successfully')
    } catch (error) {
      console.error('Error creating prescription:', error)
      return sendServerError(res, 'Failed to create prescription')
    }
  }

  /**
   * Get prescription by ID
   * GET /api/prescriptions/:id
   */
  async getPrescriptionById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const prescription = await prisma.prescription.findUnique({
        where: { id },
        include: {
          patient: {
            include: { user: true },
          },
          doctor: {
            include: { user: true, facility: true },
          },
          consultation: true,
        },
      })

      if (!prescription) {
        return sendNotFound(res, 'Prescription not found')
      }

      const formattedPrescription = formatPrescription(prescription)

      return sendSuccess(res, formattedPrescription)
    } catch (error) {
      console.error('Error fetching prescription:', error)
      return sendServerError(res, 'Failed to fetch prescription')
    }
  }

  /**
   * Get all prescriptions for a patient
   * GET /api/prescriptions/patient/:patientId
   */
  async getPatientPrescriptions(req: Request, res: Response): Promise<Response> {
    try {
      const { patientId } = req.params
      const { limit, offset } = req.query

      const prescriptions = await prisma.prescription.findMany({
        where: { patientId },
        include: {
          patient: {
            include: { user: true },
          },
          doctor: {
            include: { user: true, facility: true },
          },
          consultation: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit ? parseInt(limit as string) : undefined,
        skip: offset ? parseInt(offset as string) : undefined,
      })

      const formattedPrescriptions = prescriptions.map(p => formatPrescription(p))

      return sendSuccess(res, formattedPrescriptions)
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error)
      return sendServerError(res, 'Failed to fetch prescriptions')
    }
  }

  /**
   * Get all prescriptions by a doctor
   * GET /api/prescriptions/doctor/:doctorId
   */
  async getDoctorPrescriptions(req: Request, res: Response): Promise<Response> {
    try {
      const { doctorId } = req.params
      const { limit, offset } = req.query

      const prescriptions = await prisma.prescription.findMany({
        where: { doctorId },
        include: {
          patient: {
            include: { user: true },
          },
          doctor: {
            include: { user: true, facility: true },
          },
          consultation: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit ? parseInt(limit as string) : undefined,
        skip: offset ? parseInt(offset as string) : undefined,
      })

      const formattedPrescriptions = prescriptions.map(p => formatPrescription(p))

      return sendSuccess(res, formattedPrescriptions)
    } catch (error) {
      console.error('Error fetching doctor prescriptions:', error)
      return sendServerError(res, 'Failed to fetch prescriptions')
    }
  }

  /**
   * Verify prescription (public endpoint)
   * GET /api/prescriptions/verify/:id
   */
  async verifyPrescription(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const prescription = await prisma.prescription.findUnique({
        where: { id },
        include: {
          patient: {
            include: { user: true },
          },
          doctor: {
            include: { user: true, facility: true },
          },
        },
      })

      if (!prescription) {
        return sendSuccess(res, { valid: false, message: 'Prescription not found' })
      }

      const isExpired = prescription.validUntil && new Date(prescription.validUntil) < new Date()

      // Return limited info for verification
      const verificationData = {
        valid: true,
        expired: isExpired,
        prescription: {
          id: prescription.id,
          createdAt: prescription.createdAt,
          validUntil: prescription.validUntil,
          doctorName: `Dr. ${prescription.doctor.user.firstName} ${prescription.doctor.user.lastName}`,
          doctorRegistrationNumber: prescription.doctor.registrationNumber,
          patientName: `${prescription.patient.user.firstName} ${prescription.patient.user.lastName}`,
          facilityName: prescription.doctor.facility?.name || 'SwasthyaSetu Healthcare',
          medicationCount: Array.isArray(prescription.medications) 
            ? (prescription.medications as any[]).length 
            : 0,
        },
      }

      return sendSuccess(res, verificationData)
    } catch (error) {
      console.error('Error verifying prescription:', error)
      return sendSuccess(res, { valid: false, message: 'Verification failed' })
    }
  }

  /**
   * Update prescription
   * PUT /api/prescriptions/:id
   */
  async updatePrescription(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const doctorUserId = req.user?.userId
      const { medications, advice, followUpDate } = req.body

      // Check prescription exists and belongs to this doctor
      const existingPrescription = await prisma.prescription.findUnique({
        where: { id },
        include: { doctor: true },
      })

      if (!existingPrescription) {
        return sendNotFound(res, 'Prescription not found')
      }

      if (existingPrescription.doctor.userId !== doctorUserId) {
        return sendError(res, 'You can only update your own prescriptions', 403)
      }

      const updatedPrescription = await prisma.prescription.update({
        where: { id },
        data: {
          medications: medications || existingPrescription.medications,
          instructions: advice || existingPrescription.instructions,
          validUntil: followUpDate ? new Date(followUpDate) : existingPrescription.validUntil,
        },
        include: {
          patient: {
            include: { user: true },
          },
          doctor: {
            include: { user: true, facility: true },
          },
          consultation: true,
        },
      })

      const formattedPrescription = formatPrescription(updatedPrescription)

      return sendSuccess(res, formattedPrescription, 'Prescription updated successfully')
    } catch (error) {
      console.error('Error updating prescription:', error)
      return sendServerError(res, 'Failed to update prescription')
    }
  }
}

/**
 * Generate unique prescription number
 */
function generatePrescriptionNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.random().toString(36).substr(2, 6).toUpperCase()
  return `RX${year}${month}${day}-${random}`
}

/**
 * Format prescription for API response
 */
function formatPrescription(prescription: any, extra?: any): any {
  const patient = prescription.patient
  const doctor = prescription.doctor
  const facility = doctor.facility

  // Calculate age from date of birth
  const birthDate = new Date(patient.dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  // Parse medications from JSON
  const medications = Array.isArray(prescription.medications)
    ? prescription.medications
    : []

  return {
    id: prescription.id,
    prescriptionNumber: extra?.prescriptionNumber || `RX${prescription.id.slice(0, 8).toUpperCase()}`,
    patientId: patient.id,
    patientName: `${patient.user.firstName} ${patient.user.lastName}`,
    patientAge: age,
    patientGender: patient.gender,
    patientPhone: patient.user.phone,
    patientAddress: `${patient.village}, ${patient.taluka}, ${patient.district}`,
    
    doctorId: doctor.id,
    doctorName: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
    doctorQualification: doctor.qualification,
    doctorSpecialization: doctor.specialization,
    doctorRegistrationNumber: doctor.registrationNumber,
    doctorPhone: doctor.user.phone,
    
    facilityName: facility?.name || 'SwasthyaSetu Healthcare',
    facilityAddress: facility ? `${facility.street}, ${facility.city}, ${facility.district}` : '',
    facilityPhone: facility?.phone || '',
    
    consultationId: prescription.consultationId,
    diagnosis: extra?.diagnosis || prescription.consultation?.diagnosis || 'General Consultation',
    symptoms: extra?.symptoms || prescription.consultation?.symptoms || [],
    medications: medications,
    
    advice: prescription.instructions,
    followUpDate: prescription.validUntil?.toISOString().split('T')[0],
    validUntil: prescription.validUntil?.toISOString(),
    createdAt: prescription.createdAt.toISOString(),
    
    vitals: extra?.vitals || (prescription.consultation ? {
      bloodPressure: prescription.consultation.bloodPressureSystolic && prescription.consultation.bloodPressureDiastolic
        ? `${prescription.consultation.bloodPressureSystolic}/${prescription.consultation.bloodPressureDiastolic}`
        : undefined,
      heartRate: prescription.consultation.heartRate,
      temperature: prescription.consultation.temperature,
      weight: prescription.consultation.weight,
    } : undefined),
  }
}

export default new PrescriptionController()
