import api from './api'
import type { Doctor, ApiResponse } from '../types'

export const DEMO_DOCTORS: Doctor[] = [
  {
    id: 'doc-001',
    _id: 'doc-001',
    userId: 'u-doc-1',
    specialization: 'General Medicine & Cardiology',
    qualification: 'MBBS, MD (General Medicine)',
    registrationNumber: 'MMC-2012-08492',
    experience: 12,
    consultationFee: 300,
    teleconsultationEnabled: true,
    rating: 4.9,
    totalConsultations: 1420,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
    availability: [
      { day: 'Monday', startTime: '09:00 AM', endTime: '01:00 PM', maxAppointments: 10 },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '01:00 PM', maxAppointments: 10 },
      { day: 'Friday', startTime: '02:00 PM', endTime: '06:00 PM', maxAppointments: 10 },
    ],
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
  {
    id: 'doc-002',
    _id: 'doc-002',
    userId: 'u-doc-2',
    specialization: 'Pediatrics & Child Health',
    qualification: 'MBBS, DCH, DNB (Pediatrics)',
    registrationNumber: 'MMC-2015-11029',
    experience: 9,
    consultationFee: 250,
    teleconsultationEnabled: true,
    rating: 4.8,
    totalConsultations: 980,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
    availability: [
      { day: 'Tuesday', startTime: '10:00 AM', endTime: '02:00 PM', maxAppointments: 12 },
      { day: 'Thursday', startTime: '10:00 AM', endTime: '02:00 PM', maxAppointments: 12 },
      { day: 'Saturday', startTime: '09:00 AM', endTime: '01:00 PM', maxAppointments: 10 },
    ],
    user: {
      id: 'u-doc-2',
      _id: 'u-doc-2',
      firstName: 'Dr. Ananya',
      lastName: 'Deshmukh',
      name: 'Dr. Ananya Deshmukh',
      email: 'ananya.deshmukh@example.com',
      phone: '9823011223',
      role: 'DOCTOR',
      preferredLanguage: 'mr',
      isActive: true,
      createdAt: '2023-01-01',
      updatedAt: '2024-01-01',
    },
  },
  {
    id: 'doc-003',
    _id: 'doc-003',
    userId: 'u-doc-3',
    specialization: 'Gynecology & Maternal Health',
    qualification: 'MBBS, MS (Obstetrics & Gynecology)',
    registrationNumber: 'MMC-2010-04519',
    experience: 14,
    consultationFee: 350,
    teleconsultationEnabled: true,
    rating: 5.0,
    totalConsultations: 1850,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
    availability: [
      { day: 'Monday', startTime: '02:00 PM', endTime: '06:00 PM', maxAppointments: 8 },
      { day: 'Thursday', startTime: '02:00 PM', endTime: '06:00 PM', maxAppointments: 8 },
    ],
    user: {
      id: 'u-doc-3',
      _id: 'u-doc-3',
      firstName: 'Dr. Sunanda',
      lastName: 'Kulkarni',
      name: 'Dr. Sunanda Kulkarni',
      email: 'sunanda.kulkarni@example.com',
      phone: '9822456789',
      role: 'DOCTOR',
      preferredLanguage: 'mr',
      isActive: true,
      createdAt: '2023-01-01',
      updatedAt: '2024-01-01',
    },
  },
  {
    id: 'doc-004',
    _id: 'doc-004',
    userId: 'u-doc-4',
    specialization: 'Pulmonology & Respiratory Medicine',
    qualification: 'MBBS, MD (Pulmonary Medicine)',
    registrationNumber: 'MMC-2016-09218',
    experience: 8,
    consultationFee: 300,
    teleconsultationEnabled: true,
    rating: 4.7,
    totalConsultations: 720,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
    availability: [
      { day: 'Wednesday', startTime: '11:00 AM', endTime: '03:00 PM', maxAppointments: 8 },
      { day: 'Saturday', startTime: '02:00 PM', endTime: '06:00 PM', maxAppointments: 8 },
    ],
    user: {
      id: 'u-doc-4',
      _id: 'u-doc-4',
      firstName: 'Dr. Manoj',
      lastName: 'Shinde',
      name: 'Dr. Manoj Shinde',
      email: 'manoj.shinde@example.com',
      phone: '9821876543',
      role: 'DOCTOR',
      preferredLanguage: 'hi',
      isActive: true,
      createdAt: '2023-01-01',
      updatedAt: '2024-01-01',
    },
  },
]

export const doctorService = {
  // Get list of doctors with optional filtering
  async getDoctors(params?: { specialization?: string; district?: string; search?: string }): Promise<Doctor[]> {
    try {
      const res = await api.get<ApiResponse<Doctor[]>>('/doctors', { params })
      if (res.data?.data && res.data.data.length > 0) return res.data.data
    } catch (err) {
      console.warn('API getDoctors fallback to local', err)
    }

    let filtered = [...DEMO_DOCTORS]
    if (params?.specialization && params.specialization !== 'all') {
      filtered = filtered.filter(d => d.specialization.toLowerCase().includes(params.specialization!.toLowerCase()))
    }
    if (params?.search) {
      const query = params.search.toLowerCase()
      filtered = filtered.filter(d => 
        (d.user as any)?.firstName?.toLowerCase().includes(query) ||
        (d.user as any)?.lastName?.toLowerCase().includes(query) ||
        d.specialization.toLowerCase().includes(query)
      )
    }
    return filtered
  },

  // Get doctor by ID
  async getDoctorById(id: string): Promise<Doctor | undefined> {
    try {
      const res = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`)
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getDoctorById fallback to local', err)
    }
    return DEMO_DOCTORS.find(d => d.id === id || d._id === id)
  },

  // Get available slots for a doctor on a specific date
  async getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
    try {
      const res = await api.get<ApiResponse<string[]>>(`/doctors/${doctorId}/slots`, { params: { date } })
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getAvailableSlots fallback to local', err)
    }
    // Default morning and afternoon time slots
    return [
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
    ]
  },

  // Get distinct specializations
  async getSpecializations(): Promise<string[]> {
    try {
      const res = await api.get<ApiResponse<string[]>>('/doctors/specializations')
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getSpecializations fallback to local', err)
    }
    return [
      'General Medicine & Cardiology',
      'Pediatrics & Child Health',
      'Gynecology & Maternal Health',
      'Pulmonology & Respiratory Medicine',
      'Orthopedics',
      'Dermatology',
      'Psychiatry & Mental Health',
    ]
  },

  // Get current logged-in doctor profile & dashboard stats
  async getDoctorStats(): Promise<any> {
    try {
      const res = await api.get<ApiResponse<any>>('/doctors/me/stats')
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getDoctorStats fallback to local', err)
    }
    return {
      totalPatients: 142,
      todayAppointments: 6,
      pendingConsultations: 2,
      highRiskPatients: 5,
    }
  }
}
