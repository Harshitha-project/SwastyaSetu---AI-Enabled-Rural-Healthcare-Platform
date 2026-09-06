import { Loader2 } from 'lucide-react'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
  text?: string
}

function Loader({
  size = 'md',
  className = '',
  fullScreen = false,
  text,
}: LoaderProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizes[size]} text-primary-600 animate-spin`} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

// Page loader for route transitions
function PageLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loader size="lg" text="Loading..." />
    </div>
  )
}

// Inline loader for buttons or small spaces
function InlineLoader({ className = '' }: { className?: string }) {
  return <Loader2 className={`w-4 h-4 animate-spin ${className}`} />
}

// Skeleton loader for content placeholders
interface SkeletonProps {
  className?: string
  count?: number
}

function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
      ))}
    </>
  )
}

// Card skeleton
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export { Loader, PageLoader, InlineLoader, Skeleton, CardSkeleton };
export default Loader;
