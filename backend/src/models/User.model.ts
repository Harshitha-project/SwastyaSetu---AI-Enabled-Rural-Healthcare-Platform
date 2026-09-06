import mongoose, { Schema, Model } from 'mongoose'
import { hashPassword, comparePassword } from '../utils/password.utils'
import { IUser, UserRole } from '../types'

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number'],
    },
    role: {
      type: String,
      enum: ['PATIENT', 'DOCTOR', 'HEALTH_WORKER', 'ADMIN'] as UserRole[],
      required: [true, 'Role is required'],
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: 50,
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'mr', 'hi'],
      default: 'en',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { password, refreshToken, __v, ...rest } = ret
        return rest
      },
    },
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  try {
    this.password = await hashPassword(this.password)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return comparePassword(candidatePassword, this.password)
}

// Indexes
userSchema.index({ email: 1 })
userSchema.index({ phone: 1 })
userSchema.index({ role: 1 })
userSchema.index({ createdAt: -1 })

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema)

export default User
