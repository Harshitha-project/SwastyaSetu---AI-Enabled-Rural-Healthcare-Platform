/**
 * Push Notification Service for SwasthyaSetu
 * Handles notification permissions, subscriptions, and local notifications
 */

import { db } from './db'

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  requireInteraction?: boolean
  silent?: boolean
}

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null

  /**
   * Initialize the notification service
   */
  async init(): Promise<void> {
    if (!('Notification' in window)) {
      console.log('[Notifications] Not supported in this browser')
      return
    }

    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.ready
        console.log('[Notifications] Service worker ready')
      } catch (error) {
        console.error('[Notifications] Service worker error:', error)
      }
    }
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied'
    return Notification.permission
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.log('[Notifications] Not supported')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      console.log('[Notifications] Permission denied by user')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('[Notifications] Permission request error:', error)
      return false
    }
  }

  /**
   * Show a local notification
   */
  async show(options: NotificationOptions): Promise<void> {
    const hasPermission = await this.requestPermission()
    
    if (!hasPermission) {
      // Store notification for later viewing in-app
      await this.storeNotification(options)
      return
    }

    const notificationOptions: NotificationOptions = {
      icon: options.icon || '/icons/icon-192x192.svg',
      badge: options.badge || '/icons/icon-72x72.svg',
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction,
      silent: options.silent,
      body: options.body,
      title: options.title,
    }

    // Add actions if supported
    if (options.actions && this.swRegistration) {
      (notificationOptions as any).actions = options.actions
    }

    try {
      if (this.swRegistration) {
        // Use service worker to show notification (works in background)
        await this.swRegistration.showNotification(options.title, notificationOptions)
      } else {
        // Fallback to regular notification
        new Notification(options.title, notificationOptions)
      }

      // Also store in local DB
      await this.storeNotification(options)
    } catch (error) {
      console.error('[Notifications] Show error:', error)
      await this.storeNotification(options)
    }
  }

  /**
   * Store notification in IndexedDB for in-app display
   */
  private async storeNotification(options: NotificationOptions): Promise<void> {
    try {
      await db.addNotification({
        title: options.title,
        body: options.body,
        type: this.getNotificationType(options.tag || ''),
        data: options.data,
      })
    } catch (error) {
      console.error('[Notifications] Store error:', error)
    }
  }

  /**
   * Get notification type from tag
   */
  private getNotificationType(tag: string): 'appointment' | 'reminder' | 'alert' | 'sync' {
    if (tag.includes('appointment')) return 'appointment'
    if (tag.includes('reminder')) return 'reminder'
    if (tag.includes('alert')) return 'alert'
    return 'sync'
  }

  /**
   * Show appointment reminder notification
   */
  async showAppointmentReminder(
    appointmentId: string,
    doctorName: string,
    time: string,
    type: 'VIDEO' | 'IN_PERSON'
  ): Promise<void> {
    await this.show({
      title: 'Appointment Reminder',
      body: `Your ${type === 'VIDEO' ? 'video' : 'in-person'} consultation with ${doctorName} is at ${time}`,
      tag: `appointment-${appointmentId}`,
      data: { appointmentId, type: 'appointment' },
      actions: [
        { action: 'join', title: type === 'VIDEO' ? 'Join Call' : 'View Details' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      requireInteraction: true,
    })
  }

  /**
   * Show medicine reminder notification
   */
  async showMedicineReminder(
    reminderId: string,
    medicineName: string,
    dosage: string
  ): Promise<void> {
    await this.show({
      title: 'Medicine Reminder 💊',
      body: `Time to take ${medicineName} - ${dosage}`,
      tag: `reminder-${reminderId}`,
      data: { reminderId, type: 'reminder' },
      actions: [
        { action: 'taken', title: 'Mark as Taken' },
        { action: 'snooze', title: 'Snooze 15min' },
      ],
      requireInteraction: true,
    })
  }

  /**
   * Show high risk alert notification
   */
  async showHighRiskAlert(
    patientId: string,
    patientName: string,
    reason: string
  ): Promise<void> {
    await this.show({
      title: '⚠️ High Risk Alert',
      body: `${patientName}: ${reason}`,
      tag: `alert-${patientId}`,
      data: { patientId, type: 'alert' },
      actions: [
        { action: 'view', title: 'View Patient' },
        { action: 'call', title: 'Call Doctor' },
      ],
      requireInteraction: true,
    })
  }

  /**
   * Show sync complete notification
   */
  async showSyncComplete(success: number, failed: number): Promise<void> {
    await this.show({
      title: 'Sync Complete',
      body: `${success} items synced successfully${failed > 0 ? `, ${failed} failed` : ''}`,
      tag: 'sync-complete',
      data: { type: 'sync' },
      silent: true,
    })
  }

  /**
   * Get unread notifications from local DB
   */
  async getUnreadNotifications(): Promise<Array<{
    id: string
    title: string
    body: string
    type: string
    createdAt: number
  }>> {
    return db.getUnreadNotifications()
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await db.markNotificationRead(notificationId)
  }

  /**
   * Schedule a notification (uses setTimeout for demo, production should use service worker)
   */
  scheduleNotification(options: NotificationOptions, delayMs: number): () => void {
    const timeoutId = setTimeout(() => {
      this.show(options)
    }, delayMs)

    return () => clearTimeout(timeoutId)
  }
}

export const notificationService = new NotificationService()

// Initialize on load
if (typeof window !== 'undefined') {
  notificationService.init().catch(console.error)
}
