import { useContext } from 'react'
import { OfflineContext } from '../context/OfflineContext'

export function useOffline() {
  const context = useContext(OfflineContext)
  
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider')
  }
  
  return {
    // Connection state
    isOnline: context.isOnline,
    
    // Sync state
    pendingCount: context.pendingCount,
    pendingActions: context.pendingCount, // Alias for backward compatibility
    isSyncing: context.isSyncing,
    lastSyncTime: context.lastSyncTime,
    lastSyncResult: context.lastSyncResult,
    
    // Actions
    syncAll: context.syncAll,
    syncData: context.syncAll, // Alias for backward compatibility
    queueForSync: context.queueForSync,
    clearPending: context.clearPending,
    
    // Storage
    storageUsage: context.storageUsage,
  }
}

export default useOffline
