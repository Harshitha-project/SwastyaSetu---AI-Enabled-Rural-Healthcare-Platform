import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address')

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number (must be 10 digits starting with 6-9)')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')

// User registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['PATIENT', 'DOCTOR', 'HEALTH_WORKER', 'ADMIN']),
  preferredLanguage: z.enum(['en', 'mr', 'hi']).optional().default('en'),
})

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Address schema
export const addressSchema = z.object({
  street: z.string().optional(),
  village: z.string().min(1, 'Village is required'),
  taluka: z.string().min(1, 'Taluka is required'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required').default('Maharashtra'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid PIN code'),
})

// Emergency contact schema
export const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  phone: phoneSchema,
  relation: z.string().min(1, 'Relation is required'),
})

// Patient profile schema
export const patientProfileSchema = z.object({
  dateOfBirth: z.string().datetime().or(z.date()),
  gender: z.enum(['M', 'F', 'OTHER']),
  bloodGroup: z.string().optional(),
  address: addressSchema,
  emergencyContact: emergencyContactSchema,
  medicalHistory: z.array(z.string()).optional().default([]),
  allergies: z.array(z.string()).optional().default([]),
  currentMedications: z.array(z.string()).optional().default([]),
})

// Doctor profile schema
export const doctorProfileSchema = z.object({
  specialization: z.string().min(1, 'Specialization is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  experience: z.number().min(0).max(60),
  facilityId: objectIdSchema.optional(),
  consultationFee: z.number().min(0).optional().default(0),
  teleconsultationEnabled: z.boolean().optional().default(true),
})

// Vitals schema
export const vitalsSchema = z.object({
  heartRate: z.number().min(30).max(250).optional(),
  bloodPressure: z
    .object({
      systolic: z.number().min(60).max(250),
      diastolic: z.number().min(40).max(150),
    })
    .optional(),
  temperature: z.number().min(90).max(110).optional(),
  spo2: z.number().min(50).max(100).optional(),
  glucose: z.number().min(20).max(600).optional(),
  weight: z.number().min(1).max(500).optional(),
})

// Appointment booking schema
export const appointmentSchema = z.object({
  doctorId: objectIdSchema,
  facilityId: objectIdSchema.optional(),
  type: z.enum(['IN_PERSON', 'TELECONSULTATION']),
  scheduledDate: z.string().datetime().or(z.date()),
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  reason: z.string().min(1, 'Reason is required').max(500),
  symptoms: z.array(z.string()).optional().default([]),
  bookingNotes: z.string().max(1000).optional(),
})

// Consultation notes schema
export const consultationNotesSchema = z.object({
  symptoms: z.array(z.string()).optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  vitalsTaken: vitalsSchema.optional(),
})

// Prescription schema
export const prescriptionSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  medications: z.array(
    z.object({
      name: z.string().min(1, 'Medication name is required'),
      dosage: z.string().min(1, 'Dosage is required'),
      frequency: z.string().min(1, 'Frequency is required'),
      duration: z.string().min(1, 'Duration is required'),
      instructions: z.string().optional(),
    })
  ).min(1, 'At least one medication is required'),
  advice: z.string().optional(),
  followUpDate: z.string().datetime().or(z.date()).optional(),
})

// Medicine reminder schema
export const reminderSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.enum(['ONCE_DAILY', 'TWICE_DAILY', 'THRICE_DAILY', 'FOUR_TIMES_DAILY', 'WEEKLY', 'AS_NEEDED']),
  times: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format')),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()).optional(),
  instructions: z.string().optional(),
})

// AI assessment request schema
export const aiAssessmentSchema = z.object({
  age: z.number().min(0).max(150),
  gender: z.enum(['M', 'F', 'OTHER']),
  symptoms: z.array(z.string()).min(1, 'At least one symptom is required'),
  vitals: vitalsSchema,
  medicalHistory: z.array(z.string()).optional().default([]),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})
