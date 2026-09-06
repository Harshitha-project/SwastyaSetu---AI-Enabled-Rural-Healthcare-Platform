import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IAssignedArea {
  villages: string[]
  taluka: string
  district: string
}

export interface IHealthWorker extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  employeeId: string
  designation: string
  facilityId?: Types.ObjectId
  assignedArea: IAssignedArea
  totalPatientsRegistered: number
  createdAt: Date
  updatedAt: Date
}

const assignedAreaSchema = new Schema<IAssignedArea>(
  {
    villages: {
      type: [String],
      default: [],
    },
    taluka: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
  },
  { _id: false }
)

const healthWorkerSchema = new Schema<IHealthWorker>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
      enum: ['ASHA', 'ANM', 'MPW', 'Health Supervisor', 'Community Health Officer'],
    },
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: 'Facility',
      index: true,
    },
    assignedArea: {
      type: assignedAreaSchema,
      required: true,
    },
    totalPatientsRegistered: {
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
healthWorkerSchema.index({ employeeId: 1 })
healthWorkerSchema.index({ facilityId: 1 })
healthWorkerSchema.index({ 'assignedArea.district': 1 })
healthWorkerSchema.index({ 'assignedArea.taluka': 1 })

const HealthWorker = mongoose.model<IHealthWorker>('HealthWorker', healthWorkerSchema)

export default HealthWorker
