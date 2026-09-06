// User Types
export type UserRole = 'PATIENT' | 'DOCTOR' | 'HEALTH_WORKER' | 'ADMIN'

export interface User {
  id: string  // Prisma uses 'id'
  _id?: string  // Backward compatibility with MongoDB
  email: string
  phone: string
  role: UserRole
  firstName: string
  lastName: string
  name?: string  // Computed from firstName + lastName
  preferredLanguage: string
  isActive: boolean
  isVerified?: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthUser extends User {
  accessToken: string
}

// Patient Types
export interface Patient {
  _id: string
  userId: string | User
  dateOfBirth: string
  gender: 'M' | 'F' | 'OTHER'
  bloodGroup: string
  address: Address
  emergencyContact: EmergencyContact
  medicalHistory: string[]
  allergies: string[]
  currentMedications: string[]
  assignedWorkerId?: string
  riskLevel: RiskLevel
  createdAt: string
  updatedAt: string
}

export interface Address {
  street?: string
  village: string
  taluka: string
  district: string
  state: string
  pincode: string
}

export interface EmergencyContact {
  name: string
  phone: string
  relation: string
}

// Doctor Types
export interface Doctor {
  _id: string
  userId: string | User
  specialization: string
  qualification: string
  registrationNumber: string
  experience: number
  facilityId?: string
  availability: DoctorAvailability[]
  consultationFee: number
  teleconsultationEnabled: boolean
  rating: number
  totalConsultations: number
  createdAt: string
  updatedAt: string
}

export interface DoctorAvailability {
  day: string
  startTime: string
  endTime: string
  maxAppointments: number
}

// Health Worker Types
export interface HealthWorker {
  _id: string
  userId: string | User
  employeeId: string
  designation: string
  facilityId?: string
  assignedArea: {
    villages: string[]
    taluka: string
    district: string
  }
  totalPatientsRegistered: number
  createdAt: string
  updatedAt: string
}

// Healthcare Facility Types
export type FacilityType = 'PHC' | 'CHC' | 'DISTRICT_HOSPITAL' | 'GOVERNMENT_HOSPITAL' | 'RURAL_HOSPITAL' | 'SUB_CENTER'

export interface Facility {
  _id: string
  name: string
  type: FacilityType
  address: Address
  location: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  services: string[]
  timings: {
    open: string
    close: string
    days: string[]
  }
  contactNumber: string
  emergencyAvailable: boolean
  beds: {
    total: number
    available: number
  }
  doctors: string[]
  createdAt: string
  updatedAt: string
}

// Appointment Types
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
export type AppointmentType = 'IN_PERSON' | 'TELECONSULTATION'

export interface Appointment {
  _id: string
  patientId: string | Patient
  doctorId: string | Doctor
  facilityId?: string | Facility
  type: AppointmentType
  status: AppointmentStatus
  scheduledDate: string
  scheduledTime: string
  reason: string
  symptoms: string[]
  bookingNotes?: string
  cancelReason?: string
  createdAt: string
  updatedAt: string
}

// Consultation Types
export type ConsultationStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

export interface Consultation {
  _id: string
  appointmentId: string
  patientId: string | Patient
  doctorId: string | Doctor
  type: AppointmentType
  symptoms: string[]
  diagnosis?: string
  notes?: string
  vitalsTaken?: Vitals
  aiAssessmentId?: string
  prescriptionId?: string
  followUpDate?: string
  followUpNotes?: string
  startTime?: string
  endTime?: string
  status: ConsultationStatus
  chatMessages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  _id: string
  sender: 'PATIENT' | 'DOCTOR'
  senderId: string
  message: string
  timestamp: string
}

export interface Vitals {
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

// Medical Record Types
export type MedicalRecordType = 'CONSULTATION' | 'LAB_REPORT' | 'PRESCRIPTION' | 'IMAGING' | 'DIAGNOSIS' | 'VACCINATION' | 'OTHER'

export interface MedicalRecord {
  _id: string
  patientId: string
  type: MedicalRecordType
  title: string
  description?: string
  date: string
  consultationId?: string
  attachments?: Attachment[]
  addedBy: string
  facilityId?: string
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  filename: string
  url: string
  type: string
}

// Prescription Types
export interface Prescription {
  id?: string
  _id: string
  consultationId?: string
  appointmentId?: string
  patientId: string
  doctorId: string | Doctor
  diagnosis: string
  medications: Medication[]
  advice?: string
  notes?: string
  followUpDate?: string
  validUntil?: string
  createdAt: string
  updatedAt: string
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

// Health Metric Types
export type MetricType = 'HEART_RATE' | 'BLOOD_PRESSURE' | 'SPO2' | 'TEMPERATURE' | 'GLUCOSE' | 'WEIGHT'
export type MetricStatus = 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL'
export type MetricSource = 'MANUAL' | 'DEVICE' | 'SIMULATED'
export type SyncStatus = 'SYNCED' | 'PENDING' | 'FAILED'

export interface HealthMetric {
  _id: string
  patientId: string
  type: MetricType
  value: number | { systolic: number; diastolic: number }
  unit: string
  status: MetricStatus
  recordedAt: string
  recordedBy?: string
  source: MetricSource
  notes?: string
  syncStatus: SyncStatus
  createdAt: string
  updatedAt: string
}

// AI Assessment Types
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH'

export interface AIAssessment {
  _id: string
  patientId: string
  symptoms: string[]
  vitals: Vitals
  age: number
  medicalHistory: string[]
  riskLevel: RiskLevel
  riskScore: number
  indicators: RiskIndicator[]
  recommendation: string
  disclaimer: string
  modelVersion: string
  createdAt: string
  updatedAt: string
}

export interface RiskIndicator {
  name: string
  status: 'normal' | 'abnormal' | 'critical'
  value?: string
  message?: string
}

// Notification Types
export type NotificationType = 'APPOINTMENT' | 'ALERT' | 'REMINDER' | 'SYSTEM' | 'AI_ASSESSMENT'
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Notification {
  _id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  isRead: boolean
  actionUrl?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// Medicine Reminder Types
export type ReminderFrequency = 'ONCE_DAILY' | 'TWICE_DAILY' | 'THRICE_DAILY' | 'FOUR_TIMES_DAILY' | 'WEEKLY' | 'AS_NEEDED'

export interface MedicineReminder {
  _id: string
  patientId: string
  medicineName: string
  dosage: string
  frequency: ReminderFrequency
  times: string[]
  startDate: string
  endDate?: string
  instructions?: string
  prescriptionId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Health Article Types
export type ArticleCategory = 'MATERNAL' | 'CHILD' | 'DIABETES' | 'HEART' | 'MENTAL' | 'NUTRITION' | 'INFECTIOUS' | 'FIRST_AID'

export interface HealthArticle {
  _id: string
  title: LocalizedText
  category: ArticleCategory
  content: LocalizedText
  keyPoints: LocalizedText[]
  preventionTips: LocalizedText[]
  whenToSeekHelp: LocalizedText
  imageUrl?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface LocalizedText {
  en: string
  mr: string
  hi: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  phone: string
  name?: string  // Full name, splits into firstName/lastName on backend
  firstName?: string
  lastName?: string
  role: UserRole
  preferredLanguage?: string
}

// Stats Types
export interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  totalHealthWorkers: number
  totalFacilities: number
  totalAppointments: number
  todayAppointments: number
  pendingConsultations: number
  highRiskPatients: number
  completedConsultations: number
}
