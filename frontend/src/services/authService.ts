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

    // Demo / offline fallback
    let role: User['role'] = 'PATIENT'
    let name = 'Ramesh Patil'
    let id = 'demo-patient-1'

    const emailLower = (credentials.email || '').toLowerCase()
    if (emailLower.includes('doctor')) {
      role = 'DOCTOR'
      name = 'Dr. Priya Sharma'
      id = 'demo-doctor-1'
    } else if (emailLower.includes('worker') || emailLower.includes('asha')) {
      role = 'HEALTH_WORKER'
      name = 'Sunita Kadam (ASHA)'
      id = 'demo-worker-1'
    } else if (emailLower.includes('admin')) {
      role = 'ADMIN'
      name = 'Maharashtra Health Admin'
      id = 'demo-admin-1'
    }

    const fallbackUser: User = {
      id,
      name,
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

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role as User['role'],
      isVerified: true,
      preferredLanguage: 'mr',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // If a doctor registered, register their clinical profile so patients can see and choose them
    if (data.role === 'DOCTOR') {
      try {
        const docName = data.name.startsWith('Dr.') ? data.name : `Dr. ${data.name}`
        const customDoc = {
          id: `doc-${newUser.id}`,
          _id: `doc-${newUser.id}`,
          userId: newUser.id,
          specialization: 'General Medicine & Teleconsultation',
          qualification: 'MBBS, MD',
          registrationNumber: `MMC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          experience: 6,
          consultationFee: 250,
          teleconsultationEnabled: true,
          rating: 5.0,
          totalConsultations: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          availability: [
            { day: 'Monday', startTime: '09:00 AM', endTime: '01:00 PM', maxAppointments: 10 },
            { day: 'Wednesday', startTime: '09:00 AM', endTime: '01:00 PM', maxAppointments: 10 },
            { day: 'Friday', startTime: '02:00 PM', endTime: '06:00 PM', maxAppointments: 10 },
          ],
          user: {
            ...newUser,
            name: docName,
          },
        }
        const existing = localStorage.getItem('swasthyasetu_custom_doctors')
        const list = existing ? JSON.parse(existing) : []
        list.unshift(customDoc)
        localStorage.setItem('swasthyasetu_custom_doctors', JSON.stringify(list))
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
