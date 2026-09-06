import mongoose, { Schema, Document, Types } from 'mongoose'
import { IAddress, IEmergencyContact, RiskLevel } from '../types'

export interface IPatient extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  dateOfBirth: Date
  gender: 'M' | 'F' | 'OTHER'
  bloodGroup?: string
  address: IAddress
  emergencyContact: IEmergencyContact
  medicalHistory: string[]
  allergies: string[]
  currentMedications: string[]
  assignedWorkerId?: Types.ObjectId
  riskLevel: RiskLevel
  createdAt: Date
  updatedAt: Date
}

const addressSchema = new Schema<IAddress>(
  {
    street: String,
    village: { type: String, required: true },
    taluka: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true, default: 'Maharashtra' },
    pincode: { type: String, required: true, match: /^\d{6}$/ },
  },
  { _id: false }
)

const emergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    relation: { type: String, required: true },
  },
  { _id: false }
)

const patientSchema = new Schema<IPatient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['M', 'F', 'OTHER'],
      required: [true, 'Gender is required'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    address: {
      type: addressSchema,
      required: true,
    },
    emergencyContact: {
      type: emergencyContactSchema,
      required: true,
    },
    medicalHistory: {
      type: [String],
      default: [],
    },
    allergies: {
      type: [String],
      default: [],
    },
    currentMedications: {
      type: [String],
      default: [],
    },
    assignedWorkerId: {
      type: Schema.Types.ObjectId,
      ref: 'HealthWorker',
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH'] as RiskLevel[],
      default: 'LOW',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        const { __v, ...rest } = ret
        return rest
      },
    },
  }
)

// Virtual for age
patientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null
  const today = new Date()
  const birthDate = new Date(this.dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
})

// Indexes
patientSchema.index({ 'address.district': 1 })
patientSchema.index({ 'address.taluka': 1 })
patientSchema.index({ riskLevel: 1 })
patientSchema.index({ assignedWorkerId: 1 })
patientSchema.index({ createdAt: -1 })

const Patient = mongoose.model<IPatient>('Patient', patientSchema)

export default Patient
