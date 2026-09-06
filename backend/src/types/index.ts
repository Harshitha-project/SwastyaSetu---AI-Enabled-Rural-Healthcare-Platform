import { Request } from 'express'
import { UserRole as PrismaUserRole } from '@prisma/client'

// Re-export Prisma types for convenience
export type UserRole = PrismaUserRole

// Appointment Types
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
export type AppointmentType = 'IN_PERSON' | 'TELECONSULTATION'

// Consultation Types
export type ConsultationStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

// Health Metric Types
export type MetricType = 'HEART_RATE' | 'BLOOD_PRESSURE' | 'SPO2' | 'TEMPERATURE' | 'GLUCOSE' | 'WEIGHT'
export type MetricStatus = 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL'
export type MetricSource = 'MANUAL' | 'DEVICE' | 'SIMULATED'
export type SyncStatus = 'SYNCED' | 'PENDING' | 'FAILED'

// Risk Levels
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH'

// Medical Record Types
export type MedicalRecordType = 'CONSULTATION' | 'LAB_REPORT' | 'PRESCRIPTION' | 'IMAGING' | 'DIAGNOSIS' | 'VACCINATION' | 'OTHER'

// Facility Types
export type FacilityType = 'PHC' | 'CHC' | 'DISTRICT_HOSPITAL' | 'GOVERNMENT_HOSPITAL' | 'RURAL_HOSPITAL' | 'SUB_CENTER'

// Notification Types
export type NotificationType = 'APPOINTMENT' | 'ALERT' | 'REMINDER' | 'SYSTEM' | 'AI_ASSESSMENT'
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH'

// Reminder Frequencies
export type ReminderFrequency = 'ONCE_DAILY' | 'TWICE_DAILY' | 'THRICE_DAILY' | 'FOUR_TIMES_DAILY' | 'WEEKLY' | 'AS_NEEDED'

// Article Categories
export type ArticleCategory = 'MATERNAL' | 'CHILD' | 'DIABETES' | 'HEART' | 'MENTAL' | 'NUTRITION' | 'INFECTIOUS' | 'FIRST_AID'

// JWT Payload
export interface JwtPayload {
  userId: string
  email: string
  role: UserRole
}

// Authenticated Request
export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
    role: UserRole
  }
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Query Parameters
export interface PaginationQuery {
  page?: string
  limit?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PatientSearchQuery extends PaginationQuery {
  search?: string
  riskLevel?: RiskLevel
  district?: string
}

export interface AppointmentQuery extends PaginationQuery {
  status?: AppointmentStatus
  type?: AppointmentType
  startDate?: string
  endDate?: string
}

export interface FacilitySearchQuery extends PaginationQuery {
  type?: FacilityType
  district?: string
  services?: string
  emergency?: string
}

// Address Type
export interface IAddress {
  street?: string
  village: string
  taluka: string
  district: string
  state: string
  pincode: string
}

// Emergency Contact Type
export interface IEmergencyContact {
  name: string
  phone: string
  relation: string
}

// Vitals Type
export interface IVitals {
  heartRate?: number
  bloodPressure?: {
    systolic: number
    diastolic: number
  }
  temperature?: number
  spo2?: number
  glucose?: number
  weight?: number
}

// Risk Indicator Type
export interface IRiskIndicator {
  name: string
  status: 'normal' | 'abnormal' | 'critical'
  value?: string
  message?: string
}

// Medication Type
export interface IMedication {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

// Localized Text Type
export interface ILocalizedText {
  en: string
  mr: string
  hi: string
}

// AI Assessment Request
export interface AIAssessmentRequest {
  age: number
  gender: string
  symptoms: string[]
  vitals: IVitals
  medicalHistory: string[]
}

// AI Assessment Response
export interface AIAssessmentResponse {
  riskLevel: RiskLevel
  riskScore: number
  indicators: IRiskIndicator[]
  recommendation: string
  disclaimer: string
  modelVersion: string
}

// Login Credentials
export interface LoginCredentials {
  email: string
  password: string
}

// Register Data
export interface RegisterData {
  email: string
  password: string
  phone: string
  firstName: string
  lastName: string
  role: UserRole
  preferredLanguage?: string
}
