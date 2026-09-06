import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/role.middleware'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification,
  sendBulkNotifications,
} from '../controllers/notification.controller'

const router = Router()

// All routes require authentication
router.use(authenticate)

// GET /api/notifications - Get user's notifications
router.get('/', getNotifications)

// GET /api/notifications/unread-count - Get unread count
router.get('/unread-count', getUnreadCount)

// PUT /api/notifications/mark-all-read - Mark all as read
router.put('/mark-all-read', markAllAsRead)

// DELETE /api/notifications/clear-all - Clear all notifications
router.delete('/clear-all', clearAllNotifications)

// PUT /api/notifications/:id/read - Mark single notification as read
router.put('/:id/read', markAsRead)

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', deleteNotification)

// Admin routes
// POST /api/notifications - Create notification (admin)
router.post('/', authorize('ADMIN'), createNotification)

// POST /api/notifications/bulk - Send bulk notifications (admin)
router.post('/bulk', authorize('ADMIN'), sendBulkNotifications)

export default router
