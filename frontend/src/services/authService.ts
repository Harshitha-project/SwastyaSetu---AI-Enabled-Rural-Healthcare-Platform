import api from './api'
import type { User, LoginCredentials, RegisterData, ApiResponse } from '../types'

interface AuthResponse {
  user: User
  accessToken: string
}

interface GetMeResponse {
  user: User
}

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
      if (response.data?.data) {
        return response.data.data
      }
    } catch (err) {
      console.warn('Backend login endpoint unavailable, using resilient demo session:', err)
    }

    // Demo / offline fallback — maps each demo email to its correct identity
    const emailLower = (credentials.email || '').toLowerCase()

    // Doctor accounts — IDs must match DEMO_DOCTORS in doctorService.ts
    const DOCTOR_MAP: Record<string, { id: string; name: string; firstName: string; lastName: string; docId: string }> = {
      'doctor@demo.com':  { id: 'u-doc-1', name: 'Dr. Rajesh Patil',    firstName: 'Rajesh',  lastName: 'Patil',    docId: 'doc-001' },
      'doctor2@demo.com': { id: 'u-doc-2', name: 'Dr. Ananya Deshmukh', firstName: 'Ananya',  lastName: 'Deshmukh', docId: 'doc-002' },
      'doctor3@demo.com': { id: 'u-doc-3', name: 'Dr. Sunanda Kulkarni',firstName: 'Sunanda', lastName: 'Kulkarni', docId: 'doc-003' },
      'doctor4@demo.com': { id: 'u-doc-4', name: 'Dr. Manoj Shinde',    firstName: 'Manoj',   lastName: 'Shinde',   docId: 'doc-004' },
    }

    // Patient accounts
    const PATIENT_MAP: Record<string, { id: string; name: string; firstName: string; lastName: string }> = {
      'patient@demo.com':  { id: 'u-pat-1', name: 'Priya Sharma',   firstName: 'Priya',  lastName: 'Sharma'  },
      'patient2@demo.com': { id: 'u-pat-2', name: 'Ramesh Patil',   firstName: 'Ramesh', lastName: 'Patil'   },
      'patient3@demo.com': { id: 'u-pat-3', name: 'Sunita Jadhav',  firstName: 'Sunita', lastName: 'Jadhav'  },
      'patient4@demo.com': { id: 'u-pat-4', name: 'Amit Deshmukh',  firstName: 'Amit',   lastName: 'Deshmukh'},
    }

    let role: User['role'] = 'PATIENT'
    let id = 'u-pat-1'
    let name = 'Priya Sharma'
    let firstName = 'Priya'
    let lastName = 'Sharma'

    if (DOCTOR_MAP[emailLower]) {
      const d = DOCTOR_MAP[emailLower]
      role = 'DOCTOR'; id = d.id; name = d.name; firstName = d.firstName; lastName = d.lastName
    } else if (PATIENT_MAP[emailLower]) {
      const p = PATIENT_MAP[emailLower]
      role = 'PATIENT'; id = p.id; name = p.name; firstName = p.firstName; lastName = p.lastName
    } else if (emailLower.includes('worker') || emailLower.includes('asha')) {
      role = 'HEALTH_WORKER'; id = 'demo-worker-1'; name = 'Sunita Kadam (ASHA)'; firstName = 'Sunita'; lastName = 'Kadam'
    } else if (emailLower.includes('admin')) {
      role = 'ADMIN'; id = 'demo-admin-1'; name = 'Maharashtra Health Admin'; firstName = 'State'; lastName = 'Admin'
    } else {
      // Check registered users in localStorage
      try {
        const registered = JSON.parse(localStorage.getItem('swasthyasetu_registered_users') || '[]')
        const found = registered.find((u: any) => u.email.toLowerCase() === emailLower)
        if (found) {
          role = found.role; id = found.id; name = found.name; firstName = found.firstName; lastName = found.lastName
        }
      } catch {}
    }

    const fallbackUser: User = {
      id,
      name,
      firstName,
      lastName,
      email: credentials.email,
      phone: '+91 98220 12345',
      role,
      isVerified: true,
      preferredLanguage: 'mr',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return {
      user: fallbackUser,
      accessToken: `mock-token-${Date.now()}`,
    }
  },

  // Register
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
      if (response.data?.data) {
        return response.data.data
      }
    } catch (err) {
      console.warn('Backend register endpoint unavailable, using demo registration:', err)
    }

    const userId = `user-${Date.now()}`
    const fullName = `${data.firstName} ${data.lastName}`
    const newUser: User = {
      id: userId,
      name: fullName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: data.role as User['role'],
      isVerified: true,
      preferredLanguage: 'mr',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Persist registered user so they can log in again
    try {
      const registered = JSON.parse(localStorage.getItem('swasthyasetu_registered_users') || '[]')
      registered.unshift({ ...newUser, password: data.password })
      localStorage.setItem('swasthyasetu_registered_users', JSON.stringify(registered))
    } catch {}

    // If a doctor registered, add their clinical profile to the doctor list
    if (data.role === 'DOCTOR') {
      try {
        const docName = fullName.startsWith('Dr.') ? fullName : `Dr. ${fullName}`
        const docId = `doc-${userId}`
        const customDoc = {
          id: docId,
          _id: docId,
          userId: newUser.id,
          specialization: (data as any).specialization || 'General Medicine & Teleconsultation',
          qualification: (data as any).qualification || 'MBBS, MD',
          registrationNumber: (data as any).registrationNumber || `MMC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          experience: (data as any).experience || 5,
          consultationFee: (data as any).consultationFee || 250,
          teleconsultationEnabled: true,
          rating: 5.0,
          totalConsultations: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          availability: [
            { day: 'Monday',    startTime: '09:00 AM', endTime: '01:00 PM', maxAppointments: 10 },
            { day: 'Wednesday', startTime: '09:00 AM', endTime: '01:00 PM', maxAppointments: 10 },
            { day: 'Friday',    startTime: '02:00 PM', endTime: '06:00 PM', maxAppointments: 10 },
          ],
          user: { ...newUser, name: docName },
        }
        const existing = JSON.parse(localStorage.getItem('swasthyasetu_custom_doctors') || '[]')
        existing.unshift(customDoc)
        localStorage.setItem('swasthyasetu_custom_doctors', JSON.stringify(existing))
        // Broadcast so doctor list updates in any open tab
        try { new BroadcastChannel('swasthyasetu_records_bus').postMessage({ type: 'NEW_DOCTOR', doctor: customDoc }) } catch {}
      } catch (e) {
        console.warn('Could not cache registered doctor', e)
      }
    }

    return {
      user: newUser,
      accessToken: `mock-token-${Date.now()}`,
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      // Ignore
    }
  },

  // Get current user
  async getCurrentUser(): Promise<GetMeResponse> {
    try {
      const response = await api.get<ApiResponse<GetMeResponse>>('/auth/me')
      if (response.data?.data) {
        return response.data.data
      }
    } catch (err) {
      // Fallback
    }
    const stored = sessionStorage.getItem('swasthyasetu_auth') || localStorage.getItem('swasthyasetu_auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.user) {
          try {
            sessionStorage.setItem('swasthyasetu_auth', stored)
          } catch {}
          return { user: parsed.user }
        }
      } catch {}
    }
    throw new Error('No active session')
  },

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh')
    return response.data.data
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', { currentPassword, newPassword })
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword })
  },
}
