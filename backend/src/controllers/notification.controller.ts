import { Response } from 'express'
import { Notification } from '../models'
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendServerError,
} from '../utils/response.utils'
import { AuthRequest } from '../types'

// Get user's notifications
export async function getNotifications(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { page = 1, limit = 20, unreadOnly, type } = req.query
    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.min(50, Number(limit))
    const skip = (pageNum - 1) * limitNum

    const query: any = { userId: req.user.userId }

    if (unreadOnly === 'true') {
      query.isRead = false
    }

    if (type) {
      query.type = type
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId: req.user.userId, isRead: false }),
    ])

    return sendSuccess(res, {
      notifications,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get unread count
export async function getUnreadCount(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const count = await Notification.countDocuments({
      userId: req.user.userId,
      isRead: false,
    })

    return sendSuccess(res, { unreadCount: count })
  } catch (error) {
    console.error('Get unread count error:', error)
    return sendServerError(res, error as Error)
  }
}

// Mark notification as read
export async function markAsRead(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { id } = req.params

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    )

    if (!notification) {
      return sendNotFound(res, 'Notification not found')
    }

    return sendSuccess(res, notification, 'Marked as read')
  } catch (error) {
    console.error('Mark as read error:', error)
    return sendServerError(res, error as Error)
  }
}

// Mark all notifications as read
export async function markAllAsRead(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    await Notification.updateMany(
      { userId: req.user.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    )

    return sendSuccess(res, null, 'All notifications marked as read')
  } catch (error) {
    console.error('Mark all as read error:', error)
    return sendServerError(res, error as Error)
  }
}

// Delete notification
export async function deleteNotification(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    const { id } = req.params

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    })

    if (!notification) {
      return sendNotFound(res, 'Notification not found')
    }

    return sendSuccess(res, null, 'Notification deleted')
  } catch (error) {
    console.error('Delete notification error:', error)
    return sendServerError(res, error as Error)
  }
}

// Clear all notifications
export async function clearAllNotifications(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res)
    }

    await Notification.deleteMany({ userId: req.user.userId })

    return sendSuccess(res, null, 'All notifications cleared')
  } catch (error) {
    console.error('Clear notifications error:', error)
    return sendServerError(res, error as Error)
  }
}

// Create notification (internal use or admin)
export async function createNotification(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (req.user?.role !== 'ADMIN') {
      return sendUnauthorized(res, 'Only admins can create notifications')
    }

    const { userId, type, title, message, priority, data } = req.body

    if (!userId || !type || !title || !message) {
      return sendError(res, 'userId, type, title, and message are required')
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      priority: priority || 'MEDIUM',
      data,
    })

    return sendCreated(res, notification, 'Notification created')
  } catch (error) {
    console.error('Create notification error:', error)
    return sendServerError(res, error as Error)
  }
}

// Send bulk notifications (admin)
export async function sendBulkNotifications(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (req.user?.role !== 'ADMIN') {
      return sendUnauthorized(res, 'Only admins can send bulk notifications')
    }

    const { userIds, type, title, message, priority } = req.body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return sendError(res, 'userIds array is required')
    }

    const notifications = userIds.map((userId: string) => ({
      userId,
      type: type || 'SYSTEM',
      title,
      message,
      priority: priority || 'MEDIUM',
    }))

    await Notification.insertMany(notifications)

    return sendCreated(res, { count: userIds.length }, `${userIds.length} notifications sent`)
  } catch (error) {
    console.error('Send bulk notifications error:', error)
    return sendServerError(res, error as Error)
  }
}
