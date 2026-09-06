import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { db } from '../services/db'
import { syncService } from '../services/syncService'

interface SyncResult {
  success: number
  failed: number
  pending: number
  errors: string[]
}

interface OfflineContextType {
  // Connection state
  isOnline: boolean
  
  // Sync state
  pendingCount: number
  isSyncing: boolean
  lastSyncTime: Date | null
  lastSyncResult: SyncResult | null
  
  // Actions
  syncAll: () => Promise<SyncResult>
  queueForSync: (
    type: string,
    action: 'create' | 'update' | 'delete',
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE',
    data: unknown
  ) => Promise<string>
  clearPending: () => Promise<void>
  
  // Storage info
  storageUsage: { usage: number; quota: number } | null
}

export const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)
  const [storageUsage, setStorageUsage] = useState<{ usage: number; quota: number } | null>(null)

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Offline] Device came online')
      setIsOnline(true)
    }

    const handleOffline = () => {
      console.log('[Offline] Device went offline')
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load pending count on mount and periodically
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const count = await syncService.getPendingCount()
        setPendingCount(count)
      } catch (error) {
        console.error('[Offline] Error loading pending count:', error)
      }
    }

    loadPendingCount()

    // Refresh count every 30 seconds
    const interval = setInterval(loadPendingCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Load storage usage
  useEffect(() => {
    const loadStorageUsage = async () => {
      try {
        const usage = await db.getStorageEstimate()
        setStorageUsage(usage)
      } catch (error) {
        console.error('[Offline] Error loading storage usage:', error)
      }
    }

    loadStorageUsage()
  }, [])

  // Listen for sync completion
  useEffect(() => {
    const unsubscribe = syncService.onSyncComplete(async (result) => {
      setLastSyncResult(result)
      setLastSyncTime(new Date())
      
      // Refresh pending count
      const count = await syncService.getPendingCount()
      setPendingCount(count)
    })

    return unsubscribe
  }, [])

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      // Delay auto-sync slightly to avoid race conditions
      const timer = setTimeout(() => {
        syncAll().catch(console.error)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, pendingCount])

  // Sync all pending items
  const syncAll = useCallback(async (): Promise<SyncResult> => {
    if (isSyncing) {
      return { success: 0, failed: 0, pending: pendingCount, errors: ['Sync already in progress'] }
    }

    setIsSyncing(true)

    try {
      const result = await syncService.syncAll({
        onProgress: (completed, total) => {
          console.log(`[Offline] Sync progress: ${completed}/${total}`)
        },
      })

      setPendingCount(result.pending)
      setLastSyncTime(new Date())
      setLastSyncResult(result)

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const result: SyncResult = {
        success: 0,
        failed: 0,
        pending: pendingCount,
        errors: [errorMessage],
      }
      setLastSyncResult(result)
      return result
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing, pendingCount])

  // Queue an item for sync
  const queueForSync = useCallback(async (
    type: string,
    action: 'create' | 'update' | 'delete',
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE',
    data: unknown
  ): Promise<string> => {
    const id = await syncService.queueForSync(type, action, endpoint, method, data)
    
    // Update pending count
    const count = await syncService.getPendingCount()
    setPendingCount(count)

    return id
  }, [])

  // Clear all pending items
  const clearPending = useCallback(async (): Promise<void> => {
    await syncService.clearPending()
    setPendingCount(0)
  }, [])

  const value: OfflineContextType = {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncTime,
    lastSyncResult,
    syncAll,
    queueForSync,
    clearPending,
    storageUsage,
  }

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
}
