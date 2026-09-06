import mongoose, { Schema, Document, Types } from 'mongoose'
import { NotificationType, NotificationPriority } from '../types'

export interface INotification extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  isRead: boolean
  actionUrl?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['APPOINTMENT', 'ALERT', 'REMINDER', 'SYSTEM', 'AI_ASSESSMENT'] as NotificationType[],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: 1000,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'] as NotificationPriority[],
      default: 'MEDIUM',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    actionUrl: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, createdAt: -1 })

const Notification = mongoose.model<INotification>('Notification', notificationSchema)

export default Notification
