import mongoose, { Schema, Document, Types } from 'mongoose'
import { ConsultationStatus, AppointmentType, IVitals, IChatMessage } from '../types'

export interface IConsultation extends Document {
  _id: Types.ObjectId
  appointmentId: Types.ObjectId
  patientId: Types.ObjectId
  doctorId: Types.ObjectId
  type: AppointmentType
  symptoms: string[]
  diagnosis?: string
  notes?: string
  vitalsTaken?: IVitals
  aiAssessmentId?: Types.ObjectId
  prescriptionId?: Types.ObjectId
  followUpDate?: Date
  followUpNotes?: string
  startTime?: Date
  endTime?: Date
  status: ConsultationStatus
  chatMessages: IChatMessage[]
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

const chatMessageSchema = new Schema<IChatMessage>(
  {
    sender: {
      type: String,
      enum: ['PATIENT', 'DOCTOR'],
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
)

const consultationSchema = new Schema<IConsultation>(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
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
    type: {
      type: String,
      enum: ['IN_PERSON', 'TELECONSULTATION'] as AppointmentType[],
      required: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    diagnosis: {
      type: String,
      maxlength: 2000,
    },
    notes: {
      type: String,
      maxlength: 5000,
    },
    vitalsTaken: vitalsSchema,
    aiAssessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'AIAssessment',
    },
    prescriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    followUpDate: Date,
    followUpNotes: {
      type: String,
      maxlength: 1000,
    },
    startTime: Date,
    endTime: Date,
    status: {
      type: String,
      enum: ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'] as ConsultationStatus[],
      default: 'SCHEDULED',
      index: true,
    },
    chatMessages: {
      type: [chatMessageSchema],
      default: [],
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
consultationSchema.index({ patientId: 1, createdAt: -1 })
consultationSchema.index({ doctorId: 1, createdAt: -1 })
consultationSchema.index({ status: 1 })

const Consultation = mongoose.model<IConsultation>('Consultation', consultationSchema)

export default Consultation
