import { Response } from 'express'
import axios from 'axios'
import { AIAssessment, Patient, Notification } from '../models'
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendServerError,
} from '../utils/response.utils'
import { AuthRequest } from '../types'
import { env } from '../config/env'

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

// Create health assessment
export async function createAssessment(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401)
    }

    const { symptoms, vitals, additionalInfo } = req.body

    // Validate input
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return sendError(res, 'At least one symptom is required')
    }

    if (!vitals) {
      return sendError(res, 'Vital signs are required')
    }

    // Get patient
    let patient = null
    let patientId = null

    if (req.user.role === 'PATIENT') {
      patient = await Patient.findOne({ userId: req.user.userId })
      if (!patient) {
        return sendError(res, 'Patient profile not found')
      }
      patientId = patient._id
    } else if (req.body.patientId) {
      patient = await Patient.findById(req.body.patientId)
      patientId = req.body.patientId
    }

    // Prepare data for AI service matching FastAPI predict schema
    const assessmentData = {
      symptoms,
      age: patient && patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 35,
      gender: patient?.gender || 'OTHER',
      vitals: {
        heartRate: Number(vitals.heartRate) || 75,
        bloodPressure: {
          systolic: Number(vitals.systolic) || 120,
          diastolic: Number(vitals.diastolic) || 80,
        },
        temperature: Number(vitals.temperature) || 98.6,
        spo2: Number(vitals.oxygenLevel || vitals.spo2) || 98,
        glucose: Number(vitals.glucose) || 105,
      },
      medicalHistory: patient?.medicalHistory || [],
    }

    let aiResult: any

    try {
      // Call AI service FastAPI endpoint
      const response = await axios.post(`${AI_SERVICE_URL}/api/predict`, assessmentData, {
        timeout: 10000, // 10 second timeout
      })
      aiResult = response.data
    } catch (aiError: any) {
      console.warn('AI service error, using local fallback assessment:', aiError.message)
      // Fallback to rule-based assessment if AI service is unavailable
      aiResult = performFallbackAssessment(assessmentData)
    }

    // Determine risk level from AI result
    const riskLevel = determineRiskLevel(aiResult.risk_score || aiResult.riskScore)
    const riskScore = aiResult.risk_score || aiResult.riskScore || 0

    // Save assessment to database
    const assessment = await AIAssessment.create({
      patientId,
      symptoms,
      vitals: {
        heartRate: vitals.heartRate,
        bloodPressure: {
          systolic: vitals.systolic,
          diastolic: vitals.diastolic,
        },
        temperature: vitals.temperature,
        oxygenSaturation: vitals.oxygenLevel || vitals.spo2,
      },
      riskScore,
      riskLevel,
      indicators: aiResult.indicators || [],
      recommendation: aiResult.recommendations?.[0] || generateRecommendations(riskLevel)[0],
      aiModelVersion: aiResult.model_version || '1.0-fallback',
      createdBy: req.user.userId,
    })

    // Update patient risk level if high risk
    if (patient && (riskLevel === 'HIGH' || riskLevel === 'CRITICAL')) {
      await Patient.findByIdAndUpdate(patientId, { riskLevel })

      // Create notification for assigned health worker
      if (patient.assignedWorkerId) {
        await Notification.create({
          userId: patient.assignedWorkerId,
          type: 'ALERT',
          title: 'High Risk Patient Alert',
          message: `Patient assessment shows ${riskLevel} risk level. Immediate attention may be required.`,
          priority: 'HIGH',
          data: { assessmentId: assessment._id, patientId },
        })
      }
    }

    // Prepare response with disclaimer
    const responseData = {
      assessment: {
        id: assessment._id,
        riskLevel,
        riskScore,
        indicators: assessment.indicators,
        recommendations: assessment.recommendation,
        possibleConditions: [],
        createdAt: assessment.createdAt,
      },
      disclaimer: {
        en: 'This AI assessment is for informational purposes only and does NOT constitute medical diagnosis. Always consult a qualified healthcare professional for proper medical advice. In case of emergency, call 112 or visit the nearest hospital immediately.',
        mr: 'हे AI मूल्यांकन केवळ माहितीच्या उद्देशाने आहे आणि वैद्यकीय निदान नाही. योग्य वैद्यकीय सल्ल्यासाठी नेहमी पात्र आरोग्य व्यावसायिकांचा सल्ला घ्या. आपत्कालीन परिस्थितीत 112 वर कॉल करा.',
        hi: 'यह AI मूल्यांकन केवल सूचनात्मक उद्देश्यों के लिए है और चिकित्सा निदान नहीं है। उचित चिकित्सा सलाह के लिए हमेशा योग्य स्वास्थ्य पेशेवर से परामर्श लें। आपातकालीन स्थिति में 112 पर कॉल करें।',
      },
    }

    return sendCreated(res, responseData, 'Health assessment completed')
  } catch (error) {
    console.error('Create assessment error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get assessment history
export async function getAssessmentHistory(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { patientId } = req.params
    const { page = 1, limit = 10 } = req.query

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(50, Number(limit))
    const skip = (pageNum - 1) * limitNum

    // Check authorization
    if (req.user?.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId })
      if (!patient || patient._id.toString() !== patientId) {
        return sendError(res, 'Unauthorized access', 403)
      }
    }

    const [assessments, total] = await Promise.all([
      AIAssessment.find({ patientId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AIAssessment.countDocuments({ patientId }),
    ])

    return sendSuccess(res, {
      assessments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('Get assessment history error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get my assessments (for patients)
export async function getMyAssessments(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401)
    }

    const patient = await Patient.findOne({ userId: req.user.userId })
    if (!patient) {
      return sendError(res, 'Patient profile not found')
    }

    const { page = 1, limit = 10 } = req.query
    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(50, Number(limit))
    const skip = (pageNum - 1) * limitNum

    const [assessments, total] = await Promise.all([
      AIAssessment.find({ patientId: patient._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AIAssessment.countDocuments({ patientId: patient._id }),
    ])

    return sendSuccess(res, {
      assessments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('Get my assessments error:', error)
    return sendServerError(res, error as Error)
  }
}

// Symptom check (quick analysis without full assessment)
export async function symptomCheck(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { symptoms } = req.body

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return sendError(res, 'At least one symptom is required')
    }

    // Quick symptom analysis
    const urgentSymptoms = [
      'chest pain', 'difficulty breathing', 'severe headache',
      'loss of consciousness', 'heavy bleeding', 'stroke symptoms',
      'severe abdominal pain', 'high fever',
    ]

    const hasUrgentSymptom = symptoms.some((s: string) =>
      urgentSymptoms.some((urgent) => s.toLowerCase().includes(urgent.toLowerCase()))
    )

    const response = {
      urgencyLevel: hasUrgentSymptom ? 'HIGH' : symptoms.length > 5 ? 'MODERATE' : 'LOW',
      recommendation: hasUrgentSymptom
        ? 'Your symptoms suggest a potentially serious condition. Please seek immediate medical attention or call emergency services (112).'
        : symptoms.length > 5
        ? 'You have multiple symptoms. We recommend consulting a doctor within 24-48 hours.'
        : 'Your symptoms appear mild. Monitor your condition and consult a doctor if symptoms persist or worsen.',
      suggestedAction: hasUrgentSymptom
        ? 'EMERGENCY'
        : symptoms.length > 5
        ? 'BOOK_APPOINTMENT'
        : 'MONITOR',
      disclaimer: 'This is a preliminary check only. For accurate diagnosis, please consult a healthcare professional.',
    }

    return sendSuccess(res, response)
  } catch (error) {
    console.error('Symptom check error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get assessment by ID
export async function getAssessmentById(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params

    const assessment = await AIAssessment.findById(id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .lean()

    if (!assessment) {
      return sendNotFound(res, 'Assessment not found')
    }

    return sendSuccess(res, assessment)
  } catch (error) {
    console.error('Get assessment error:', error)
    return sendServerError(res, error as Error)
  }
}

// Helper Functions

function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

function determineRiskLevel(score: number): string {
  if (score >= 80) return 'CRITICAL'
  if (score >= 60) return 'HIGH'
  if (score >= 40) return 'MODERATE'
  return 'LOW'
}

function generateRecommendations(riskLevel: string): string[] {
  const recommendations: { [key: string]: string[] } = {
    CRITICAL: [
      'Seek immediate medical attention',
      'Call emergency services (112) if symptoms worsen',
      'Do not delay - visit nearest hospital emergency room',
      'Have someone accompany you',
    ],
    HIGH: [
      'Consult a doctor within 24 hours',
      'Monitor your symptoms closely',
      'Take prescribed medications if any',
      'Rest and stay hydrated',
      'Avoid strenuous activities',
    ],
    MODERATE: [
      'Schedule a doctor consultation within 2-3 days',
      'Monitor your symptoms',
      'Maintain healthy diet and hydration',
      'Get adequate rest',
      'Contact doctor if symptoms worsen',
    ],
    LOW: [
      'Continue monitoring your health',
      'Maintain healthy lifestyle habits',
      'Stay hydrated and get enough sleep',
      'Consult a doctor if symptoms persist beyond a week',
    ],
  }

  return recommendations[riskLevel] || recommendations.LOW
}

function performFallbackAssessment(data: any): any {
  // Rule-based fallback when AI service is unavailable
  let riskScore = 0

  // Analyze symptoms
  const severeSymptoms = ['chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness']
  const moderateSymptoms = ['fever', 'cough', 'body pain', 'fatigue', 'nausea']

  data.symptoms.forEach((symptom: string) => {
    const symptomLower = symptom.toLowerCase()
    if (severeSymptoms.some((s) => symptomLower.includes(s))) {
      riskScore += 20
    } else if (moderateSymptoms.some((s) => symptomLower.includes(s))) {
      riskScore += 10
    } else {
      riskScore += 5
    }
  })

  // Analyze vitals
  const { heart_rate, systolic_bp, diastolic_bp, temperature, spo2 } = data.vitals

  // Heart rate analysis
  if (heart_rate < 50 || heart_rate > 120) riskScore += 15
  else if (heart_rate < 60 || heart_rate > 100) riskScore += 5

  // Blood pressure analysis
  if (systolic_bp > 180 || diastolic_bp > 120) riskScore += 25
  else if (systolic_bp > 140 || diastolic_bp > 90) riskScore += 10

  // Temperature analysis
  if (temperature > 103 || temperature < 95) riskScore += 20
  else if (temperature > 100.4) riskScore += 10

  // Oxygen saturation analysis
  if (spo2 < 90) riskScore += 30
  else if (spo2 < 95) riskScore += 15

  // Consider patient history
  if (data.patient_info?.chronic_conditions?.length > 0) {
    riskScore += data.patient_info.chronic_conditions.length * 5
  }

  // Cap at 100
  riskScore = Math.min(100, riskScore)

  const indicators = []
  
  if (heart_rate < 60 || heart_rate > 100) {
    indicators.push({ name: 'Heart Rate', status: 'WARNING', value: heart_rate })
  }
  if (systolic_bp > 140 || diastolic_bp > 90) {
    indicators.push({ name: 'Blood Pressure', status: 'WARNING', value: `${systolic_bp}/${diastolic_bp}` })
  }
  if (temperature > 100.4) {
    indicators.push({ name: 'Temperature', status: 'WARNING', value: temperature })
  }
  if (spo2 < 95) {
    indicators.push({ name: 'Oxygen Level', status: spo2 < 90 ? 'CRITICAL' : 'WARNING', value: spo2 })
  }

  return {
    risk_score: riskScore,
    indicators,
    recommendations: generateRecommendations(determineRiskLevel(riskScore)),
    possible_conditions: [],
    model_version: '1.0-fallback-rules',
  }
}
