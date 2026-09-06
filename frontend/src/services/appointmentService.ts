import api from './api'
import type { Appointment, ApiResponse } from '../types'

export interface CreateAppointmentDto {
  doctorId: string
  scheduledDate: string
  scheduledTime: string
  type: 'IN_PERSON' | 'VIDEO' | 'AUDIO' | 'CHAT'
  reason?: string
  notes?: string
}

// Initial demo appointments for fallback
const INITIAL_DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    _id: 'apt-101',
    patientId: 'pat-001',
    doctorId: 'doc-001',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledTime: '10:30 AM',
    duration: 30,
    type: 'VIDEO',
    status: 'CONFIRMED',
    reason: 'Follow-up for chest tightness and mild fever',
    doctor: {
      id: 'doc-001',
      _id: 'doc-001',
      userId: 'u-doc-1',
      specialization: 'General Physician & Cardiologist',
      qualification: 'MBBS, MD (Medicine)',
      registrationNumber: 'MCI-2015-84920',
      experience: 12,
      consultationFee: 300,
      teleconsultationEnabled: true,
      rating: 4.9,
      totalConsultations: 1240,
      createdAt: '2023-01-01',
      updatedAt: '2024-01-01',
      availability: [],
      user: {
        id: 'u-doc-1',
        _id: 'u-doc-1',
        firstName: 'Dr. Rajesh',
        lastName: 'Patil',
        name: 'Dr. Rajesh Patil',
        email: 'doctor@demo.com',
        phone: '9876543211',
        role: 'DOCTOR',
        preferredLanguage: 'mr',
        isActive: true,
        createdAt: '2023-01-01',
        updatedAt: '2024-01-01',
      },
    },
    patient: {
      id: 'pat-001',
      _id: 'pat-001',
      userId: 'u-pat-1',
      dateOfBirth: '1992-05-14',
      gender: 'F',
      bloodGroup: 'B+',
      riskLevel: 'MODERATE',
      address: {
        village: 'Khed',
        taluka: 'Shirur',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '410501',
      },
      emergencyContact: {
        name: 'Sanjay Sharma',
        phone: '9822012345',
        relation: 'Spouse',
      },
      medicalHistory: ['Mild Hypertension'],
      allergies: ['Penicillin'],
      currentMedications: ['Amlodipine 5mg'],
      createdAt: '2023-01-01',
      updatedAt: '2024-01-01',
      user: {
        id: 'u-pat-1',
        _id: 'u-pat-1',
        firstName: 'Priya',
        lastName: 'Sharma',
        name: 'Priya Sharma',
        email: 'patient@demo.com',
        phone: '9876543210',
        role: 'PATIENT',
        preferredLanguage: 'en',
        isActive: true,
        createdAt: '2023-01-01',
        updatedAt: '2024-01-01',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'apt-102',
    _id: 'apt-102',
    patientId: 'pat-002',
    doctorId: 'doc-001',
    scheduledDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    scheduledTime: '11:15 AM',
    duration: 30,
    type: 'IN_PERSON',
    status: 'SCHEDULED',
    reason: 'Routine seasonal checkup and blood sugar review',
    doctor: {
      id: 'doc-001',
      _id: 'doc-001',
      userId: 'u-doc-1',
      specialization: 'General Physician & Cardiologist',
      qualification: 'MBBS, MD (Medicine)',
      registrationNumber: 'MCI-2015-84920',
      experience: 12,
      consultationFee: 300,
      teleconsultationEnabled: true,
      rating: 4.9,
      totalConsultations: 1240,
      createdAt: '2023-01-01',
      updatedAt: '2024-01-01',
      availability: [],
      user: {
        id: 'u-doc-1',
        _id: 'u-doc-1',
        firstName: 'Dr. Rajesh',
        lastName: 'Patil',
        name: 'Dr. Rajesh Patil',
        email: 'doctor@demo.com',
        phone: '9876543211',
        role: 'DOCTOR',
        preferredLanguage: 'mr',
        isActive: true,
        createdAt: '2023-01-01',
        updatedAt: '2024-01-01',
      },
    },
    patient: {
      id: 'pat-002',
      _id: 'pat-002',
      userId: 'u-pat-2',
      dateOfBirth: '1975-08-20',
      gender: 'M',
      bloodGroup: 'O+',
      riskLevel: 'HIGH',
      address: {
        village: 'Velhe',
        taluka: 'Velhe',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '412212',
      },
      emergencyContact: {
        name: 'Sunita Jadhav',
        phone: '9822998877',
        relation: 'Sister',
      },
      medicalHistory: ['Type 2 Diabetes', 'Hypertension'],
      allergies: ['Sulfa drugs'],
      currentMedications: ['Metformin 500mg', 'Telmisartan 40mg'],
      createdAt: '2023-01-01',
      updatedAt: '2024-01-01',
      user: {
        id: 'u-pat-2',
        _id: 'u-pat-2',
        firstName: 'Ramesh',
        lastName: 'Jadhav',
        name: 'Ramesh Jadhav',
        email: 'ramesh.jadhav@example.com',
        phone: '9890123456',
        role: 'PATIENT',
        preferredLanguage: 'mr',
        isActive: true,
        createdAt: '2023-01-01',
        updatedAt: '2024-01-01',
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

function getLocalAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem('swasthyasetu_appointments')
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to parse local appointments', e)
  }
  localStorage.setItem('swasthyasetu_appointments', JSON.stringify(INITIAL_DEMO_APPOINTMENTS))
  return INITIAL_DEMO_APPOINTMENTS
}

function saveLocalAppointments(apts: Appointment[]) {
  try {
    localStorage.setItem('swasthyasetu_appointments', JSON.stringify(apts))
  } catch (e) {
    console.error('Failed to save local appointments', e)
  }
}

export const appointmentService = {
  // Get all appointments (filtered by current user or query)
  async getAppointments(params?: { status?: string; type?: string; fromDate?: string; toDate?: string }): Promise<Appointment[]> {
    try {
      const res = await api.get<ApiResponse<Appointment[]>>('/appointments', { params })
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getAppointments fallback to local', err)
    }
    return getLocalAppointments()
  },

  // Get upcoming appointments
  async getUpcomingAppointments(): Promise<Appointment[]> {
    try {
      const res = await api.get<ApiResponse<Appointment[]>>('/appointments/upcoming')
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getUpcomingAppointments fallback to local', err)
    }
    const all = getLocalAppointments()
    return all.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
  },

  // Get today's appointments for doctor
  async getTodaysAppointments(): Promise<Appointment[]> {
    try {
      const res = await api.get<ApiResponse<Appointment[]>>('/appointments/today')
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getTodaysAppointments fallback to local', err)
    }
    return getLocalAppointments()
  },

  // Get appointment by ID
  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    try {
      const res = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`)
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getAppointmentById fallback to local', err)
    }
    const all = getLocalAppointments()
    return all.find(a => a.id === id || a._id === id)
  },

  // Book new appointment
  async createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
    try {
      const res = await api.post<ApiResponse<Appointment>>('/appointments', dto)
      if (res.data?.data) {
        // Also save to local
        const all = getLocalAppointments()
        all.unshift(res.data.data)
        saveLocalAppointments(all)
        return res.data.data
      }
    } catch (err) {
      console.warn('API createAppointment fallback to local', err)
    }

    const all = getLocalAppointments()
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      _id: `apt-${Date.now()}`,
      patientId: 'pat-001',
      doctorId: dto.doctorId,
      scheduledDate: dto.scheduledDate,
      scheduledTime: dto.scheduledTime,
      type: dto.type,
      status: 'CONFIRMED',
      reason: dto.reason || 'General medical consultation',
      notes: dto.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      doctor: {
        id: dto.doctorId,
        _id: dto.doctorId,
        userId: 'u-doc-1',
        specialization: 'General Physician',
        qualification: 'MBBS, MD',
        registrationNumber: 'MCI-2015-84920',
        experience: 10,
        consultationFee: 300,
        teleconsultationEnabled: true,
        rating: 4.8,
        totalConsultations: 950,
        createdAt: '2023-01-01',
        updatedAt: '2024-01-01',
        availability: [],
        user: {
          id: 'u-doc-1',
          _id: 'u-doc-1',
          firstName: 'Dr. Rajesh',
          lastName: 'Patil',
          name: 'Dr. Rajesh Patil',
          email: 'doctor@demo.com',
          phone: '9876543211',
          role: 'DOCTOR',
          preferredLanguage: 'mr',
          isActive: true,
          createdAt: '2023-01-01',
          updatedAt: '2024-01-01',
        },
      },
    }

    all.unshift(newAppointment)
    saveLocalAppointments(all)
    return newAppointment
  },

  // Update status (e.g. CANCELLED, COMPLETED, IN_PROGRESS)
  async updateStatus(id: string, status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): Promise<Appointment | undefined> {
    try {
      const res = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status })
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API updateStatus fallback to local', err)
    }

    const all = getLocalAppointments()
    const found = all.find(a => a.id === id || a._id === id)
    if (found) {
      found.status = status
      found.updatedAt = new Date().toISOString()
      saveLocalAppointments(all)
      return found
    }
    return undefined
  },

  // Cancel appointment
  async cancelAppointment(id: string): Promise<boolean> {
    return !!(await this.updateStatus(id, 'CANCELLED'))
  }
}
