import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { OfflineProvider } from './context/OfflineContext'
import { Toaster } from '@/components/ui/toaster'
import { OfflineIndicator } from './components/pwa/OfflineIndicator'
import { InstallPrompt } from './components/pwa/InstallPrompt'
import AppRouter from './router'
import { useRegisterSW } from 'virtual:pwa-register/react'

function PWAUpdater() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('[PWA] Service worker registered:', r)
    },
    onRegisterError(error) {
      console.error('[PWA] Service worker registration error:', error)
    },
  })

  useEffect(() => {
    if (needRefresh) {
      // Auto-update in background, or show prompt
      const shouldUpdate = window.confirm(
        'A new version of SwasthyaSetu is available. Reload to update?'
      )
      if (shouldUpdate) {
        updateServiceWorker(true)
      } else {
        setNeedRefresh(false)
      }
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <OfflineProvider>
            <PWAUpdater />
            <AppRouter />
            <Toaster />
            <OfflineIndicator position="bottom" showSyncButton={true} />
            <InstallPrompt />
          </OfflineProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
