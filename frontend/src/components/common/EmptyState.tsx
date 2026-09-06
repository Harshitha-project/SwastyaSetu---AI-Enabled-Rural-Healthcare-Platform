import { ReactNode } from 'react'
import { FileQuestion, Search, Calendar, Users, Activity } from 'lucide-react'
import Button from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Pre-configured empty states
export function NoResultsEmpty({ searchTerm }: { searchTerm?: string }) {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8" />}
      title="No results found"
      description={
        searchTerm
          ? `We couldn't find anything matching "${searchTerm}". Try adjusting your search.`
          : "We couldn't find any results. Try adjusting your filters."
      }
    />
  )
}

export function NoDataEmpty({ type = 'data' }: { type?: string }) {
  return (
    <EmptyState
      icon={<FileQuestion className="w-8 h-8" />}
      title={`No ${type} yet`}
      description={`There's no ${type} to display at the moment.`}
    />
  )
}

export function NoAppointmentsEmpty({ onBook }: { onBook?: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="w-8 h-8" />}
      title="No appointments"
      description="You don't have any appointments scheduled. Book an appointment to consult with a doctor."
      action={onBook ? { label: 'Book Appointment', onClick: onBook } : undefined}
    />
  )
}

export function NoPatientsEmpty() {
  return (
    <EmptyState
      icon={<Users className="w-8 h-8" />}
      title="No patients found"
      description="There are no patients matching your criteria."
    />
  )
}

export function NoHealthDataEmpty({ onRecord }: { onRecord?: () => void }) {
  return (
    <EmptyState
      icon={<Activity className="w-8 h-8" />}
      title="No health data"
      description="Start tracking your health by recording your vitals."
      action={onRecord ? { label: 'Record Vitals', onClick: onRecord } : undefined}
    />
  )
}
