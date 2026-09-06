import mongoose, { Schema, Document, Types } from 'mongoose'
import { RiskLevel, IVitals, IRiskIndicator } from '../types'

export interface IAIAssessment extends Document {
  _id: Types.ObjectId
  patientId: Types.ObjectId
  symptoms: string[]
  vitals: IVitals
  age: number
  medicalHistory: string[]
  riskLevel: RiskLevel
  riskScore: number
  indicators: IRiskIndicator[]
  recommendation: string
  disclaimer: string
  modelVersion: string
  createdAt: Date
  updatedAt: Date
}

const vitalsSchema = new Schema<IVitals>(
  {
    heartRate: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    temperature: Number,
    spo2: Number,
    glucose: Number,
    weight: Number,
  },
  { _id: false }
)

const indicatorSchema = new Schema<IRiskIndicator>(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['normal', 'abnormal', 'critical'],
      required: true,
    },
    value: String,
    message: String,
  },
  { _id: false }
)

const aiAssessmentSchema = new Schema<IAIAssessment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    symptoms: {
      type: [String],
      required: true,
    },
    vitals: vitalsSchema,
    age: {
      type: Number,
      required: true,
    },
    medicalHistory: {
      type: [String],
      default: [],
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH'] as RiskLevel[],
      required: true,
      index: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    indicators: {
      type: [indicatorSchema],
      default: [],
    },
    recommendation: {
      type: String,
      required: true,
    },
    disclaimer: {
      type: String,
      required: true,
      default: 'This is an AI-assisted preliminary risk assessment and is NOT a medical diagnosis. Please consult a qualified healthcare professional for proper medical evaluation.',
    },
    modelVersion: {
      type: String,
      required: true,
      default: '1.0.0',
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

// Indexes
aiAssessmentSchema.index({ patientId: 1, createdAt: -1 })
aiAssessmentSchema.index({ riskLevel: 1 })

const AIAssessment = mongoose.model<IAIAssessment>('AIAssessment', aiAssessmentSchema)

export default AIAssessment
