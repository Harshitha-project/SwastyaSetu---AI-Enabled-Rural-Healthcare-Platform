import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { useOffline } from '../../hooks/useOffline'
import { Button } from '@/components/ui/button'

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom'
  showSyncButton?: boolean
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = 'bottom',
  showSyncButton = true,
}) => {
  const { isOnline, pendingCount, syncAll } = useOffline()
  const [isVisible, setIsVisible] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<'success' | 'error' | null>(null)
  const [dismissed, setDismissed] = useState(false)

  // Show indicator when offline or when coming back online with pending items
  useEffect(() => {
    if (!isOnline) {
      setIsVisible(true)
      setDismissed(false)
    } else if (pendingCount > 0) {
      setIsVisible(true)
      setDismissed(false)
    } else {
      // Hide after a delay when back online with no pending items
      const timer = setTimeout(() => setIsVisible(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, pendingCount])

  // Clear sync result after showing
  useEffect(() => {
    if (syncResult) {
      const timer = setTimeout(() => setSyncResult(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [syncResult])

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncResult(null)
    try {
      const result = await syncAll()
      setSyncResult(result.failed > 0 ? 'error' : 'success')
    } catch (error) {
      setSyncResult('error')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    setTimeout(() => setIsVisible(false), 300)
  }

  if (!isVisible || dismissed) return null

  const positionClasses = position === 'top'
    ? 'top-0 left-0 right-0'
    : 'bottom-0 left-0 right-0'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
        className={`fixed ${positionClasses} z-50 px-4 py-2 safe-area-inset`}
      >
        <div className={`mx-auto max-w-md rounded-xl shadow-lg border backdrop-blur-sm ${
          !isOnline
            ? 'bg-amber-50/95 border-amber-200 text-amber-900'
            : syncResult === 'error'
            ? 'bg-red-50/95 border-red-200 text-red-900'
            : syncResult === 'success'
            ? 'bg-green-50/95 border-green-200 text-green-900'
            : 'bg-blue-50/95 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              {!isOnline ? (
                <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
              ) : syncResult === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              ) : syncResult === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              ) : pendingCount > 0 ? (
                <RefreshCw className={`w-5 h-5 text-blue-600 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
              ) : (
                <Wifi className="w-5 h-5 text-green-600 shrink-0" />
              )}
              
              <div className="text-sm">
                {!isOnline ? (
                  <>
                    <p className="font-semibold">You're offline</p>
                    <p className="text-xs opacity-80">Changes will sync when connected</p>
                  </>
                ) : syncResult === 'success' ? (
                  <p className="font-semibold">All data synced successfully!</p>
                ) : syncResult === 'error' ? (
                  <p className="font-semibold">Some items failed to sync</p>
                ) : pendingCount > 0 ? (
                  <>
                    <p className="font-semibold">{pendingCount} items pending sync</p>
                    <p className="text-xs opacity-80">Tap sync to upload</p>
                  </>
                ) : (
                  <p className="font-semibold">Back online!</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {showSyncButton && isOnline && pendingCount > 0 && !syncResult && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={handleSync}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Sync
                    </>
                  )}
                </Button>
              )}
              
              {(isOnline || pendingCount === 0) && (
                <button
                  onClick={handleDismiss}
                  className="p-1 rounded-full hover:bg-black/5 transition-colors"
                >
                  <X className="w-4 h-4 opacity-60" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default OfflineIndicator
