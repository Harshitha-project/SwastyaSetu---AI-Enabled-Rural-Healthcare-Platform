import mongoose, { Schema, Document, Types } from 'mongoose'
import { AppointmentStatus, AppointmentType } from '../types'

export interface IAppointment extends Document {
  _id: Types.ObjectId
  patientId: Types.ObjectId
  doctorId: Types.ObjectId
  facilityId?: Types.ObjectId
  type: AppointmentType
  status: AppointmentStatus
  scheduledDate: Date
  scheduledTime: string
  reason: string
  symptoms: string[]
  bookingNotes?: string
  cancelReason?: string
  createdAt: Date
  updatedAt: Date
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID is required'],
      index: true,
    },
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
      index: true,
    },
    type: {
      type: String,
      enum: ['IN_PERSON', 'TELECONSULTATION'] as AppointmentType[],
      required: [true, 'Appointment type is required'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as AppointmentStatus[],
      default: 'PENDING',
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true,
    },
    scheduledTime: {
      type: String,
      required: [true, 'Scheduled time is required'],
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
      maxlength: 500,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    bookingNotes: {
      type: String,
      maxlength: 1000,
    },
    cancelReason: {
      type: String,
      maxlength: 500,
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

// Compound indexes for common queries
appointmentSchema.index({ doctorId: 1, scheduledDate: 1 })
appointmentSchema.index({ patientId: 1, scheduledDate: -1 })
appointmentSchema.index({ status: 1, scheduledDate: 1 })
appointmentSchema.index({ scheduledDate: 1, status: 1 })

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema)

export default Appointment
