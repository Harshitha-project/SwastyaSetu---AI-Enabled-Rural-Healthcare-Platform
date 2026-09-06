import mongoose, { Schema, Document, Types } from 'mongoose'
import { MedicalRecordType } from '../types'

export interface IAttachment {
  filename: string
  url: string
  type: string
}

export interface IMedicalRecord extends Document {
  _id: Types.ObjectId
  patientId: Types.ObjectId
  type: MedicalRecordType
  title: string
  description?: string
  date: Date
  consultationId?: Types.ObjectId
  attachments?: IAttachment[]
  addedBy: Types.ObjectId
  facilityId?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const attachmentSchema = new Schema<IAttachment>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
  },
  { _id: false }
)

const medicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['CONSULTATION', 'LAB_REPORT', 'PRESCRIPTION', 'IMAGING', 'DIAGNOSIS', 'VACCINATION', 'OTHER'] as MedicalRecordType[],
      required: [true, 'Record type is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
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
medicalRecordSchema.index({ patientId: 1, date: -1 })
medicalRecordSchema.index({ patientId: 1, type: 1 })

const MedicalRecord = mongoose.model<IMedicalRecord>('MedicalRecord', medicalRecordSchema)

export default MedicalRecord
