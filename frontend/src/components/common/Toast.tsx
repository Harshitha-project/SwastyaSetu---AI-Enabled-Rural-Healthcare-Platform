import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import type { ToastType } from '../../context/ToastContext'

interface ToastProps {
  type: ToastType
  title: string
  message?: string
  onClose: () => void
}

export default function Toast({ type, title, message, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 200)
  }

  useEffect(() => {
    // Add animation class after mount
    const timer = setTimeout(() => {
      const el = document.getElementById(`toast-${title}`)
      if (el) el.classList.add('toast-enter')
    }, 10)
    return () => clearTimeout(timer)
  }, [title])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  }

  const backgrounds = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  }

  return (
    <div
      id={`toast-${title}`}
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg 
        transform transition-all duration-200 ease-out
        ${backgrounds[type]}
        ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {message && (
          <p className="text-sm text-gray-600 mt-1">{message}</p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-200 transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  )
}
