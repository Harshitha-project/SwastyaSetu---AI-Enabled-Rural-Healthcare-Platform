/**
 * Sync Service for SwasthyaSetu
 * Handles background synchronization of offline data
 */

import { db } from './db'
import api from './api'

interface SyncResult {
  success: number
  failed: number
  pending: number
  errors: string[]
}

interface SyncOptions {
  maxRetries?: number
  onProgress?: (completed: number, total: number) => void
  onItemSync?: (item: { id: string; type: string; success: boolean }) => void
}

class SyncService {
  private isSyncing = false
  private syncListeners: Set<(result: SyncResult) => void> = new Set()

  /**
   * Register a listener for sync completion
   */
  onSyncComplete(listener: (result: SyncResult) => void): () => void {
    this.syncListeners.add(listener)
    return () => this.syncListeners.delete(listener)
  }

  /**
   * Check if currently syncing
   */
  getIsSyncing(): boolean {
    return this.isSyncing
  }

  /**
   * Get count of pending items
   */
  async getPendingCount(): Promise<number> {
    return db.getPendingSyncCount()
  }

  /**
   * Add an item to the sync queue
   */
  async queueForSync(
    type: string,
    action: 'create' | 'update' | 'delete',
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE',
    data: unknown
  ): Promise<string> {
    const id = await db.addPendingSync({
      type,
      action,
      endpoint,
      method,
      data,
    })

    // Attempt immediate sync if online
    if (navigator.onLine) {
      this.syncAll({ maxRetries: 1 }).catch(console.error)
    }

    // Request background sync if available
    this.requestBackgroundSync()

    return id
  }

  /**
   * Request background sync via Service Worker
   */
  private async requestBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await (registration as any).sync.register('sync-pending-data')
        console.log('[Sync] Background sync registered')
      } catch (error) {
        console.log('[Sync] Background sync not available:', error)
      }
    }
  }

  /**
   * Sync all pending items
   */
  async syncAll(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[Sync] Already syncing, skipping...')
      const pending = await this.getPendingCount()
      return { success: 0, failed: 0, pending, errors: ['Sync already in progress'] }
    }

    if (!navigator.onLine) {
      console.log('[Sync] Offline, skipping sync...')
      const pending = await this.getPendingCount()
      return { success: 0, failed: 0, pending, errors: ['Device is offline'] }
    }

    this.isSyncing = true
    const { maxRetries = 3, onProgress, onItemSync } = options

    const result: SyncResult = {
      success: 0,
      failed: 0,
      pending: 0,
      errors: [],
    }

    try {
      const items = await db.getPendingSyncs()
      const total = items.length

      console.log(`[Sync] Starting sync of ${total} items`)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        // Skip items that have exceeded retry limit
        if (item.retryCount >= maxRetries) {
          result.failed++
          result.errors.push(`${item.type}: Exceeded max retries`)
          onItemSync?.({ id: item.id, type: item.type, success: false })
          continue
        }

        try {
          await this.syncItem(item)
          await db.removePendingSync(item.id)
          result.success++
          onItemSync?.({ id: item.id, type: item.type, success: true })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          await db.updatePendingSyncRetry(item.id, errorMessage)
          result.failed++
          result.errors.push(`${item.type}: ${errorMessage}`)
          onItemSync?.({ id: item.id, type: item.type, success: false })
        }

        onProgress?.(i + 1, total)
      }

      result.pending = await this.getPendingCount()
      console.log(`[Sync] Complete: ${result.success} success, ${result.failed} failed, ${result.pending} pending`)

      // Notify listeners
      this.syncListeners.forEach(listener => listener(result))

      // Show notification if sync completed with failures
      if (result.failed > 0) {
        this.showSyncNotification(result)
      }

    } finally {
      this.isSyncing = false
    }

    return result
  }

  /**
   * Sync a single item
   */
  private async syncItem(item: Awaited<ReturnType<typeof db.getPendingSyncs>>[0]): Promise<void> {
    console.log(`[Sync] Syncing ${item.type} (${item.action}) to ${item.endpoint}`)

    switch (item.method) {
      case 'POST':
        await api.post(item.endpoint, item.data)
        break
      case 'PUT':
        await api.put(item.endpoint, item.data)
        break
      case 'DELETE':
        await api.delete(item.endpoint)
        break
    }
  }

  /**
   * Show notification about sync results
   */
  private async showSyncNotification(result: SyncResult): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SwasthyaSetu Sync', {
        body: `Synced ${result.success} items. ${result.failed} failed.`,
        icon: '/icons/icon-192x192.svg',
        tag: 'sync-result',
      })
    }
  }

  /**
   * Clear all pending syncs (use with caution)
   */
  async clearPending(): Promise<void> {
    await db.clearAllPendingSyncs()
    console.log('[Sync] Cleared all pending syncs')
  }

  /**
   * Retry failed syncs
   */
  async retryFailed(): Promise<SyncResult> {
    // Reset retry counts for failed items
    const items = await db.getPendingSyncs()
    for (const item of items) {
      if (item.retryCount > 0) {
        item.retryCount = 0
        item.lastError = undefined
      }
    }

    return this.syncAll()
  }
}

// Export singleton instance
export const syncService = new SyncService()

// Auto-sync when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Sync] Device came online, starting sync...')
    syncService.syncAll().catch(console.error)
  })
}
