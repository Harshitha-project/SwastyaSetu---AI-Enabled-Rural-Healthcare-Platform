import mongoose, { Schema, Document, Types } from 'mongoose'
import { ReminderFrequency } from '../types'

export interface IMedicineReminder extends Document {
  _id: Types.ObjectId
  patientId: Types.ObjectId
  medicineName: string
  dosage: string
  frequency: ReminderFrequency
  times: string[]
  startDate: Date
  endDate?: Date
  instructions?: string
  prescriptionId?: Types.ObjectId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const medicineReminderSchema = new Schema<IMedicineReminder>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      maxlength: 200,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
    },
    frequency: {
      type: String,
      enum: ['ONCE_DAILY', 'TWICE_DAILY', 'THRICE_DAILY', 'FOUR_TIMES_DAILY', 'WEEKLY', 'AS_NEEDED'] as ReminderFrequency[],
      required: true,
    },
    times: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.every((t) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(t)),
        message: 'Invalid time format. Use HH:MM format.',
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    instructions: {
      type: String,
      maxlength: 500,
    },
    prescriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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
medicineReminderSchema.index({ patientId: 1, isActive: 1 })

const MedicineReminder = mongoose.model<IMedicineReminder>('MedicineReminder', medicineReminderSchema)

export default MedicineReminder
