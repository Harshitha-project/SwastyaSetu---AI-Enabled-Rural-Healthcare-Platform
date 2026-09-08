import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, LoginCredentials, RegisterData } from '../types'
import { authService } from '../services/authService'
import { storage } from '../utils/helpers'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
  switchRole: (role: 'PATIENT' | 'DOCTOR' | 'HEALTH_WORKER' | 'ADMIN') => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'swasthyasetu_auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedAuth = storage.get<{ user: User; accessToken: string }>(AUTH_STORAGE_KEY)
        
        if (storedAuth?.accessToken) {
          // Verify token is still valid by fetching current user
          const response = await authService.getCurrentUser()
          // Handle both direct user object and nested {user: ...} response
          const currentUser = response && typeof response === 'object' && 'user' in response 
            ? (response as { user: User }).user 
            : response
          setUser(currentUser)
        }
      } catch (error) {
        // Token invalid or expired, clear storage
        console.error('Auth initialization failed:', error)
        storage.remove(AUTH_STORAGE_KEY)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await authService.login(credentials)
      const { user: loggedInUser, accessToken } = response
      
      // Store auth data
      storage.set(AUTH_STORAGE_KEY, { user: loggedInUser, accessToken })
      setUser(loggedInUser)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const switchRole = useCallback((role: 'PATIENT' | 'DOCTOR' | 'HEALTH_WORKER' | 'ADMIN') => {
    let mockUser: User
    if (role === 'DOCTOR') {
      mockUser = {
        id: 'u-doc-1',
        name: 'Dr. Rajesh Patil',
        firstName: 'Rajesh',
        lastName: 'Patil',
        email: 'doctor@demo.com',
        phone: '+91 98765 43211',
        role: 'DOCTOR',
        isVerified: true,
        preferredLanguage: 'mr',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    } else if (role === 'HEALTH_WORKER') {
      mockUser = {
        id: 'demo-worker-1',
        name: 'Sunita Kadam (ASHA)',
        firstName: 'Sunita',
        lastName: 'Kadam',
        email: 'worker@swasthyasetu.org',
        phone: '+91 98220 98765',
        role: 'HEALTH_WORKER',
        isVerified: true,
        preferredLanguage: 'mr',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    } else if (role === 'ADMIN') {
      mockUser = {
        id: 'demo-admin-1',
        name: 'Health Admin',
        firstName: 'State',
        lastName: 'Admin',
        email: 'admin@swasthyasetu.org',
        phone: '+91 98220 11111',
        role: 'ADMIN',
        isVerified: true,
        preferredLanguage: 'mr',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    } else {
      mockUser = {
        id: 'u-pat-1',
        name: 'Priya Sharma',
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'patient@demo.com',
        phone: '+91 98765 43210',
        role: 'PATIENT',
        isVerified: true,
        preferredLanguage: 'mr',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    const authData = { user: mockUser, accessToken: `mock-token-${role.toLowerCase()}-${Date.now()}` }
    storage.set(AUTH_STORAGE_KEY, authData)
    setUser(mockUser)
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await authService.register(data)
      const { user: newUser, accessToken } = response
      
      // Store auth data
      storage.set(AUTH_STORAGE_KEY, { user: newUser, accessToken })
      setUser(newUser)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Ignore logout errors
      console.error('Logout error:', error)
    } finally {
      storage.remove(AUTH_STORAGE_KEY)
      setUser(null)
    }
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    const storedAuth = storage.get<{ user: User; accessToken: string }>(AUTH_STORAGE_KEY)
    if (storedAuth) {
      storage.set(AUTH_STORAGE_KEY, { ...storedAuth, user: updatedUser })
    }
    setUser(updatedUser)
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    switchRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
