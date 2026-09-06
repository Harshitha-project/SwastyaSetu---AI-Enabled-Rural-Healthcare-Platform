import { useState, useCallback } from 'react'
import { useToast } from './useToast'

interface UseApiOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
}

interface UseApiReturn<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  execute: (...args: unknown[]) => Promise<T | null>
  reset: () => void
}

export function useApi<T>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const { showSuccessToast = false, showErrorToast = true, successMessage } = options
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await apiFunction(...args)
        setData(result)
        
        if (showSuccessToast) {
          toast.success(successMessage || 'Operation successful')
        }
        
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        
        if (showErrorToast) {
          toast.error('Error', errorMessage)
        }
        
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [apiFunction, showSuccessToast, showErrorToast, successMessage, toast]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return { data, isLoading, error, execute, reset }
}
