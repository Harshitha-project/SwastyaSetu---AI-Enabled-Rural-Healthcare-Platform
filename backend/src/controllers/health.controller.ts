import { Response } from 'express'
import { HealthMetric, Patient, Notification } from '../models'
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendServerError,
} from '../utils/response.utils'
import { AuthRequest, MetricType, MetricStatus } from '../types'

// Vital ranges for status determination
const VITAL_RANGES: Record<string, { min: number; max: number; criticalMin: number; criticalMax: number; unit: string }> = {
  HEART_RATE: { min: 60, max: 100, criticalMin: 40, criticalMax: 150, unit: 'bpm' },
  SPO2: { min: 95, max: 100, criticalMin: 90, criticalMax: 100, unit: '%' },
  TEMPERATURE: { min: 97, max: 99, criticalMin: 95, criticalMax: 104, unit: '°F' },
  GLUCOSE: { min: 70, max: 140, criticalMin: 50, criticalMax: 300, unit: 'mg/dL' },
  WEIGHT: { min: 30, max: 200, criticalMin: 20, criticalMax: 300, unit: 'kg' },
}

// Record a single health metric
export async function recordMetrics(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { patientId, type, value, notes, source = 'MANUAL' } = req.body

    // Determine patient
    let actualPatientId = patientId
    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId })
      if (!patient) return sendError(res, 'Patient profile not found')
      actualPatientId = patient._id.toString()
    }

    if (!actualPatientId) {
      return sendError(res, 'Patient ID is required')
    }

    if (!type || value === undefined) {
      return sendError(res, 'Metric type and value are required')
    }

    // Determine status based on value
    const status = determineStatus(type, value)
    const unit = getUnit(type)

    // Create metric record
    const metric = await HealthMetric.create({
      patientId: actualPatientId,
      type,
      value,
      unit,
      status,
      source,
      notes,
      recordedBy: req.user.userId,
      recordedAt: new Date(),
      syncStatus: 'SYNCED',
    })

    // Check for alerts
    if (status === 'CRITICAL' || status === 'HIGH') {
      const patient = await Patient.findById(actualPatientId)
      
      // Update patient risk level if critical
      if (status === 'CRITICAL' && patient) {
        await Patient.findByIdAndUpdate(actualPatientId, { riskLevel: 'HIGH' })
      }

      // Notify health worker if assigned
      if (patient?.assignedWorkerId) {
        await Notification.create({
          userId: patient.assignedWorkerId,
          type: 'ALERT',
          title: status === 'CRITICAL' ? 'Critical Vital Alert' : 'Abnormal Vital Alert',
          message: `Patient has ${status.toLowerCase()} ${type.replace('_', ' ').toLowerCase()}: ${formatValue(type, value)} ${unit}`,
          priority: status === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
          data: { metricId: metric._id, patientId: actualPatientId },
        })
      }
    }

    return sendCreated(res, { 
      metric, 
      alert: status === 'CRITICAL' || status === 'HIGH' ? {
        type,
        value,
        status,
        message: `${type.replace('_', ' ')} is ${status.toLowerCase()}`
      } : null 
    }, 'Health metric recorded')
  } catch (error) {
    console.error('Record metrics error:', error)
    return sendServerError(res, error as Error)
  }
}

// Record multiple metrics at once
export async function recordMultipleMetrics(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { patientId, metrics, source = 'MANUAL' } = req.body

    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return sendError(res, 'Metrics array is required')
    }

    // Determine patient
    let actualPatientId = patientId
    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId })
      if (!patient) return sendError(res, 'Patient profile not found')
      actualPatientId = patient._id.toString()
    }

    const recordedMetrics = []
    const alerts = []

    for (const m of metrics) {
      const status = determineStatus(m.type, m.value)
      const unit = getUnit(m.type)

      const metric = await HealthMetric.create({
        patientId: actualPatientId,
        type: m.type,
        value: m.value,
        unit,
        status,
        source,
        recordedBy: req.user.userId,
        recordedAt: new Date(),
        syncStatus: 'SYNCED',
      })

      recordedMetrics.push(metric)

      if (status === 'CRITICAL' || status === 'HIGH') {
        alerts.push({
          type: m.type,
          value: m.value,
          status,
        })
      }
    }

    return sendCreated(res, { metrics: recordedMetrics, alerts }, 'Metrics recorded')
  } catch (error) {
    console.error('Record multiple metrics error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get health metrics for a patient
export async function getMetrics(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { patientId } = req.params
    const { page = 1, limit = 30, fromDate, toDate, type } = req.query

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(100, Number(limit))
    const skip = (pageNum - 1) * limitNum

    // Authorization check
    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId })
      if (!patient || patient._id.toString() !== patientId) {
        return sendUnauthorized(res, 'Access denied')
      }
    }

    const query: any = { patientId }

    if (fromDate) {
      query.recordedAt = { ...query.recordedAt, $gte: new Date(fromDate as string) }
    }
    if (toDate) {
      query.recordedAt = { ...query.recordedAt, $lte: new Date(toDate as string) }
    }
    if (type) {
      query.type = type
    }

    const [metrics, total] = await Promise.all([
      HealthMetric.find(query)
        .sort({ recordedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      HealthMetric.countDocuments(query),
    ])

    return sendSuccess(res, {
      metrics,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('Get metrics error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get latest metrics for a patient (one of each type)
export async function getLatestMetrics(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    let patientId = req.params.patientId

    // If patient, get their own
    if (req.user.role === 'PATIENT') {
      const patient = await Patient.findOne({ userId: req.user.userId })
      if (!patient) return sendError(res, 'Patient profile not found')
      patientId = patient._id.toString()
    }

    // Get latest of each type
    const metricTypes: MetricType[] = ['HEART_RATE', 'BLOOD_PRESSURE', 'SPO2', 'TEMPERATURE', 'GLUCOSE', 'WEIGHT']
    
    const latestMetrics: Record<string, any> = {}

    for (const type of metricTypes) {
      const metric = await HealthMetric.findOne({ patientId, type })
        .sort({ recordedAt: -1 })
        .lean()
      
      if (metric) {
        latestMetrics[type] = metric
      }
    }

    return sendSuccess(res, latestMetrics)
  } catch (error) {
    console.error('Get latest metrics error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get metrics trend (for charts)
export async function getMetricsTrend(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { patientId } = req.params
    const { days = 30, type } = req.query

    if (!type) {
      return sendError(res, 'Metric type is required')
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - Number(days))

    const metrics = await HealthMetric.find({
      patientId,
      type,
      recordedAt: { $gte: startDate },
    })
      .sort({ recordedAt: 1 })
      .lean()

    // Format for charts
    const trendData = {
      labels: metrics.map((m: any) => 
        new Date(m.recordedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      ),
      values: metrics.map((m: any) => m.value),
      statuses: metrics.map((m: any) => m.status),
    }

    // Calculate statistics
    const values = metrics.map((m: any) => {
      if (type === 'BLOOD_PRESSURE') {
        return (m.value as any).systolic
      }
      return m.value as number
    })

    const stats = values.length > 0 ? {
      min: Math.min(...values),
      max: Math.max(...values),
      average: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
      count: values.length,
    } : null

    return sendSuccess(res, {
      type,
      trend: trendData,
      stats,
      period: `${days} days`,
    })
  } catch (error) {
    console.error('Get metrics trend error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get my metrics (for patients)
export async function getMyMetrics(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const patient = await Patient.findOne({ userId: req.user.userId })
    if (!patient) {
      return sendError(res, 'Patient profile not found')
    }

    const { page = 1, limit = 30, type } = req.query
    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(100, Number(limit))
    const skip = (pageNum - 1) * limitNum

    const query: any = { patientId: patient._id }
    if (type) {
      query.type = type
    }

    const [metrics, total] = await Promise.all([
      HealthMetric.find(query)
        .sort({ recordedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      HealthMetric.countDocuments(query),
    ])

    return sendSuccess(res, {
      metrics,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('Get my metrics error:', error)
    return sendServerError(res, error as Error)
  }
}

// Delete a metric record
export async function deleteMetric(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params

    const metric = await HealthMetric.findById(id)
    if (!metric) {
      return sendNotFound(res, 'Metric not found')
    }

    // Only the recorder or admin can delete
    if (req.user?.role !== 'ADMIN' && metric.recordedBy?.toString() !== req.user?.userId) {
      return sendUnauthorized(res, 'Not authorized to delete this record')
    }

    await HealthMetric.findByIdAndDelete(id)

    return sendSuccess(res, null, 'Metric deleted')
  } catch (error) {
    console.error('Delete metric error:', error)
    return sendServerError(res, error as Error)
  }
}

// Helper functions
function determineStatus(type: string, value: any): MetricStatus {
  if (type === 'BLOOD_PRESSURE') {
    const { systolic, diastolic } = value
    if (systolic > 180 || diastolic > 120) return 'CRITICAL'
    if (systolic > 140 || diastolic > 90) return 'HIGH'
    if (systolic < 90 || diastolic < 60) return 'LOW'
    return 'NORMAL'
  }

  const range = VITAL_RANGES[type]
  if (!range) return 'NORMAL'

  const numValue = Number(value)
  if (numValue < range.criticalMin || numValue > range.criticalMax) return 'CRITICAL'
  if (numValue < range.min) return 'LOW'
  if (numValue > range.max) return 'HIGH'
  return 'NORMAL'
}

function getUnit(type: string): string {
  if (type === 'BLOOD_PRESSURE') return 'mmHg'
  return VITAL_RANGES[type]?.unit || ''
}

function formatValue(type: string, value: any): string {
  if (type === 'BLOOD_PRESSURE') {
    return `${value.systolic}/${value.diastolic}`
  }
  return String(value)
}
