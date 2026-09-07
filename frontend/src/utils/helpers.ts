import { VITAL_RANGES } from './constants'
import type { MetricStatus, RiskLevel, Vitals } from '../types'

// Format date to readable string
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }
  return new Date(date).toLocaleDateString('en-IN', defaultOptions)
}

// Format time to readable string
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

// Format date and time together
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get relative time (e.g., "2 hours ago")
export function getRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return formatDate(date)
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: string | Date): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

// Get full name from user object
export function getFullName(user: { firstName: string; lastName: string }): string {
  return `${user.firstName} ${user.lastName}`.trim()
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Check vital status based on normal ranges
export function getVitalStatus(type: keyof typeof VITAL_RANGES, value: number | { systolic: number; diastolic: number }): MetricStatus {
  const range = VITAL_RANGES[type]
  
  if (type === 'BLOOD_PRESSURE' && typeof value === 'object') {
    const { systolic, diastolic } = value
    const bpRange = range as { systolic: { min: number; max: number }; diastolic: { min: number; max: number } }
    const sysRange = bpRange.systolic
    const diaRange = bpRange.diastolic
    
    if (systolic > 180 || diastolic > 120) return 'CRITICAL'
    if (systolic > sysRange.max || diastolic > diaRange.max) return 'HIGH'
    if (systolic < sysRange.min || diastolic < diaRange.min) return 'LOW'
    return 'NORMAL'
  }
  
  if (typeof value === 'number' && 'min' in range && 'max' in range) {
    const numRange = range as { min: number; max: number }
    
    // Critical thresholds
    if (type === 'SPO2' && value < 90) return 'CRITICAL'
    if (type === 'HEART_RATE' && (value < 40 || value > 150)) return 'CRITICAL'
    if (type === 'TEMPERATURE' && (value < 95 || value > 104)) return 'CRITICAL'
    
    if (value < numRange.min) return 'LOW'
    if (value > numRange.max) return 'HIGH'
    return 'NORMAL'
  }
  
  return 'NORMAL'
}

// Format vital value for display
export function formatVitalValue(type: keyof typeof VITAL_RANGES, value: number | { systolic: number; diastolic: number }): string {
  if (type === 'BLOOD_PRESSURE' && typeof value === 'object') {
    return `${value.systolic}/${value.diastolic}`
  }
  return String(value)
}

// Get risk level color class
export function getRiskLevelColor(level: RiskLevel): { bg: string; text: string; border: string } {
  const colors = {
    LOW: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    MODERATE: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    HIGH: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  }
  return colors[level]
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  // Remove non-digits
  const digits = phone.replace(/\D/g, '')
  
  // Format as Indian phone number
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  
  return phone
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Indian)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Group array by key
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

// Sort by date
export function sortByDate<T extends { createdAt: string }>(
  array: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...array].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return order === 'desc' ? dateB - dateA : dateA - dateB
  })
}

// Check if date is today
export function isToday(date: string | Date): boolean {
  const today = new Date()
  const checkDate = new Date(date)
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  )
}

// Check if date is in the past
export function isPast(date: string | Date): boolean {
  return new Date(date) < new Date()
}

// Get greeting based on time of day
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

// Calculate BMI
export function calculateBMI(weight: number, heightCm: number): { value: number; category: string } {
  const heightM = heightCm / 100
  const bmi = weight / (heightM * heightM)
  
  let category: string
  if (bmi < 18.5) category = 'Underweight'
  else if (bmi < 25) category = 'Normal'
  else if (bmi < 30) category = 'Overweight'
  else category = 'Obese'
  
  return { value: Math.round(bmi * 10) / 10, category }
}

// Parse vitals from different formats
export function parseVitals(vitals: Partial<Vitals>): Vitals {
  return {
    heartRate: vitals.heartRate,
    bloodPressure: vitals.bloodPressure,
    temperature: vitals.temperature,
    spo2: vitals.spo2,
    glucose: vitals.glucose,
    weight: vitals.weight,
  }
}

// Storage helpers (tab-isolated session priority with local fallback)
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const sessionItem = sessionStorage.getItem(key)
      if (sessionItem) return JSON.parse(sessionItem)
      const localItem = localStorage.getItem(key)
      if (localItem) {
        try {
          sessionStorage.setItem(key, localItem)
        } catch {}
        return JSON.parse(localItem)
      }
      return null
    } catch {
      return null
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      const serialized = JSON.stringify(value)
      sessionStorage.setItem(key, serialized)
      localStorage.setItem(key, serialized)
    } catch {
      console.error('Error saving to storage')
    }
  },
  remove: (key: string): void => {
    try {
      sessionStorage.removeItem(key)
      localStorage.removeItem(key)
    } catch {
      console.error('Error removing from storage')
    }
  },
}
