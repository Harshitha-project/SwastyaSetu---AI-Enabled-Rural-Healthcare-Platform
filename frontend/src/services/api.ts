import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { storage } from '../utils/helpers'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authData = storage.get<{ accessToken: string }>('swasthyasetu_auth')
    
    if (authData?.accessToken) {
      config.headers.Authorization = `Bearer ${authData.accessToken}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        })

        const { accessToken, user } = response.data.data
        
        // Update stored auth
        storage.set('swasthyasetu_auth', { user, accessToken })
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        storage.remove('swasthyasetu_auth')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Extract error message
    const errorMessage = 
      (error.response?.data as { message?: string })?.message || 
      error.message || 
      'An unexpected error occurred'

    return Promise.reject(new Error(errorMessage))
  }
)

export default api
