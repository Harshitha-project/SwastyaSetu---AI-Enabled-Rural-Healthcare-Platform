import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick,
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const baseClasses = 'bg-white rounded-xl shadow-card'
  const hoverClasses = hover
    ? 'transition-shadow duration-200 hover:shadow-card-hover cursor-pointer'
    : ''
  const clickableClasses = onClick ? 'cursor-pointer' : ''

  return (
    <div
      className={`${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// Card Header
interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// Card Content
interface CardContentProps {
  children: ReactNode
  className?: string
}

function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>
}

// Card Footer
interface CardFooterProps {
  children: ReactNode
  className?: string
}

function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardContent, CardFooter };
export default Card;
