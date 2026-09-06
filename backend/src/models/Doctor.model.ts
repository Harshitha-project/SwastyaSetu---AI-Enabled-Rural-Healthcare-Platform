import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IDoctorAvailability {
  day: string
  startTime: string
  endTime: string
  maxAppointments: number
}

export interface IDoctor extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  specialization: string
  qualification: string
  registrationNumber: string
  experience: number
  facilityId?: Types.ObjectId
  availability: IDoctorAvailability[]
  consultationFee: number
  teleconsultationEnabled: boolean
  rating: number
  totalConsultations: number
  createdAt: Date
  updatedAt: Date
}

const availabilitySchema = new Schema<IDoctorAvailability>(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    maxAppointments: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
      default: 20,
    },
  },
  { _id: false }
)

const doctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      index: true,
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Medical registration number is required'],
      unique: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
      max: 60,
    },
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
      index: true,
    },
    availability: {
      type: [availabilitySchema],
      default: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', maxAppointments: 20 },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', maxAppointments: 20 },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', maxAppointments: 20 },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', maxAppointments: 20 },
        { day: 'Friday', startTime: '09:00', endTime: '17:00', maxAppointments: 20 },
      ],
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    teleconsultationEnabled: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalConsultations: {
      type: Number,
      default: 0,
      min: 0,
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
doctorSchema.index({ specialization: 1 })
doctorSchema.index({ facilityId: 1 })
doctorSchema.index({ teleconsultationEnabled: 1 })
doctorSchema.index({ rating: -1 })

const Doctor = mongoose.model<IDoctor>('Doctor', doctorSchema)

export default Doctor
