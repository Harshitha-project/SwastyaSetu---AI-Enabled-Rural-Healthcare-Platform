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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
