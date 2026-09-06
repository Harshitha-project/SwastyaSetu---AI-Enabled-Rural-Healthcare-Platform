import { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'error' | 'info' | 'primary' | 'secondary'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
  dot?: boolean
}

function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
  }

  const dotColors = {
    default: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  )
}

// Risk level badge
interface RiskBadgeProps {
  level: 'LOW' | 'MODERATE' | 'HIGH'
  showDot?: boolean
}

function RiskBadge({ level, showDot = true }: RiskBadgeProps) {
  const config = {
    LOW: { variant: 'success' as BadgeVariant, label: 'Low Risk' },
    MODERATE: { variant: 'warning' as BadgeVariant, label: 'Moderate Risk' },
    HIGH: { variant: 'danger' as BadgeVariant, label: 'High Risk' },
  }

  const { variant, label } = config[level]

  return (
    <Badge variant={variant} dot={showDot}>
      {label}
    </Badge>
  )
}

// Status badge
interface StatusBadgeProps {
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'ONGOING' | 'SCHEDULED'
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' },
    CONFIRMED: { variant: 'info', label: 'Confirmed' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    CANCELLED: { variant: 'default', label: 'Cancelled' },
    NO_SHOW: { variant: 'danger', label: 'No Show' },
    ONGOING: { variant: 'primary', label: 'Ongoing' },
    SCHEDULED: { variant: 'info', label: 'Scheduled' },
  }

  const { variant, label } = config[status] || { variant: 'default', label: status }

  return <Badge variant={variant}>{label}</Badge>
}

export { Badge, RiskBadge, StatusBadge };
export default Badge;
