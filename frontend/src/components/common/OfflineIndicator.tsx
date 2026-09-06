import { WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react'
import { useOffline } from '../../hooks/useOffline'

function OfflineIndicator() {
  const { isOnline, pendingCount, syncAll } = useOffline()

  if (isOnline && pendingCount === 0) {
    return null
  }

  return (
    <div
      className={`
        fixed bottom-4 left-4 z-40 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
        ${isOnline ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}
      `}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-800">You're offline</p>
            <p className="text-xs text-red-600">
              {pendingCount > 0
                ? `${pendingCount} item(s) pending sync`
                : 'Changes will sync when online'}
            </p>
          </div>
        </>
      ) : pendingCount > 0 ? (
        <>
          <CloudOff className="w-5 h-5 text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {pendingCount} pending sync
            </p>
            <p className="text-xs text-yellow-600">Tap to sync now</p>
          </div>
          <button
            onClick={syncAll}
            className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition-colors"
            aria-label="Sync now"
          >
            <RefreshCw className="w-4 h-4 text-yellow-700" />
          </button>
        </>
      ) : null}
    </div>
  )
}

// Sync status badge
interface SyncStatusProps {
  status: 'synced' | 'pending' | 'syncing' | 'failed'
  className?: string
}

function SyncStatusBadge({ status, className = '' }: SyncStatusProps) {
  const config = {
    synced: {
      icon: <Cloud className="w-4 h-4" />,
      text: 'Synced',
      bg: 'bg-green-100',
      textColor: 'text-green-700',
    },
    pending: {
      icon: <CloudOff className="w-4 h-4" />,
      text: 'Pending',
      bg: 'bg-yellow-100',
      textColor: 'text-yellow-700',
    },
    syncing: {
      icon: <RefreshCw className="w-4 h-4 animate-spin" />,
      text: 'Syncing',
      bg: 'bg-blue-100',
      textColor: 'text-blue-700',
    },
    failed: {
      icon: <CloudOff className="w-4 h-4" />,
      text: 'Sync Failed',
      bg: 'bg-red-100',
      textColor: 'text-red-700',
    },
  }

  const { icon, text, bg, textColor } = config[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${bg} ${textColor} ${className}`}
    >
      {icon}
      {text}
    </span>
  )
}

export { OfflineIndicator, SyncStatusBadge };
export default OfflineIndicator;
