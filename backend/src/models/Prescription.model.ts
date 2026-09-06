import mongoose, { Schema, Document, Types } from 'mongoose'
import { IMedication } from '../types'

export interface IPrescription extends Document {
  _id: Types.ObjectId
  consultationId: Types.ObjectId
  patientId: Types.ObjectId
  doctorId: Types.ObjectId
  diagnosis: string
  medications: IMedication[]
  advice?: string
  followUpDate?: Date
  validUntil: Date
  createdAt: Date
  updatedAt: Date
}

const medicationSchema = new Schema<IMedication>(
  {
    name: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
)

const prescriptionSchema = new Schema<IPrescription>(
  {
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      maxlength: 2000,
    },
    medications: {
      type: [medicationSchema],
      required: true,
      validate: {
        validator: (v: IMedication[]) => v.length > 0,
        message: 'At least one medication is required',
      },
    },
    advice: {
      type: String,
      maxlength: 2000,
    },
    followUpDate: Date,
    validUntil: {
      type: Date,
      required: true,
      default: () => {
        const date = new Date()
        date.setDate(date.getDate() + 30) // Valid for 30 days by default
        return date
      },
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

// Indexes
prescriptionSchema.index({ patientId: 1, createdAt: -1 })
prescriptionSchema.index({ doctorId: 1, createdAt: -1 })

const Prescription = mongoose.model<IPrescription>('Prescription', prescriptionSchema)

export default Prescription
