import mongoose, { Schema, Document, Types } from 'mongoose'
import { FacilityType, IAddress } from '../types'

export interface IFacilityTimings {
  open: string
  close: string
  days: string[]
}

export interface IFacilityBeds {
  total: number
  available: number
}

export interface IFacility extends Document {
  _id: Types.ObjectId
  name: string
  type: FacilityType
  address: IAddress
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  services: string[]
  timings: IFacilityTimings
  contactNumber: string
  emergencyAvailable: boolean
  beds: IFacilityBeds
  doctors: Types.ObjectId[]
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

const timingsSchema = new Schema<IFacilityTimings>(
  {
    open: { type: String, required: true, default: '08:00' },
    close: { type: String, required: true, default: '20:00' },
    days: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  },
  { _id: false }
)

const bedsSchema = new Schema<IFacilityBeds>(
  {
    total: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
  },
  { _id: false }
)

const facilitySchema = new Schema<IFacility>(
  {
    name: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['PHC', 'CHC', 'DISTRICT_HOSPITAL', 'GOVERNMENT_HOSPITAL', 'RURAL_HOSPITAL', 'SUB_CENTER'] as FacilityType[],
      required: [true, 'Facility type is required'],
      index: true,
    },
    address: {
      type: addressSchema,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere',
      },
    },
    services: {
      type: [String],
      default: [],
    },
    timings: {
      type: timingsSchema,
      default: () => ({}),
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
    },
    emergencyAvailable: {
      type: Boolean,
      default: false,
      index: true,
    },
    beds: {
      type: bedsSchema,
      default: () => ({}),
    },
    doctors: [{
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
    }],
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

// Geospatial index for location queries
facilitySchema.index({ location: '2dsphere' })
facilitySchema.index({ 'address.district': 1 })
facilitySchema.index({ 'address.taluka': 1 })
facilitySchema.index({ type: 1 })
facilitySchema.index({ emergencyAvailable: 1 })

const Facility = mongoose.model<IFacility>('Facility', facilitySchema)

export default Facility
