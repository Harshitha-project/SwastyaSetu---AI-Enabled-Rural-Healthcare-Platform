import mongoose, { Schema, Document, Types } from 'mongoose'
import { MetricType, MetricStatus, MetricSource, SyncStatus } from '../types'

export interface IHealthMetric extends Document {
  _id: Types.ObjectId
  patientId: Types.ObjectId
  type: MetricType
  value: number | { systolic: number; diastolic: number }
  unit: string
  status: MetricStatus
  recordedAt: Date
  recordedBy?: Types.ObjectId
  source: MetricSource
  notes?: string
  syncStatus: SyncStatus
  createdAt: Date
  updatedAt: Date
}

const healthMetricSchema = new Schema<IHealthMetric>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['HEART_RATE', 'BLOOD_PRESSURE', 'SPO2', 'TEMPERATURE', 'GLUCOSE', 'WEIGHT'] as MetricType[],
      required: [true, 'Metric type is required'],
      index: true,
    },
    value: {
      type: Schema.Types.Mixed, // Number or { systolic, diastolic }
      required: [true, 'Value is required'],
    },
    unit: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['NORMAL', 'LOW', 'HIGH', 'CRITICAL'] as MetricStatus[],
      default: 'NORMAL',
      index: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    source: {
      type: String,
      enum: ['MANUAL', 'DEVICE', 'SIMULATED'] as MetricSource[],
      default: 'MANUAL',
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    syncStatus: {
      type: String,
      enum: ['SYNCED', 'PENDING', 'FAILED'] as SyncStatus[],
      default: 'SYNCED',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { __v, ...rest } = ret
        return rest
      },
    },
  }
)

// Indexes for efficient querying
healthMetricSchema.index({ patientId: 1, type: 1, recordedAt: -1 })
healthMetricSchema.index({ patientId: 1, recordedAt: -1 })
healthMetricSchema.index({ status: 1 })

const HealthMetric = mongoose.model<IHealthMetric>('HealthMetric', healthMetricSchema)

export default HealthMetric
