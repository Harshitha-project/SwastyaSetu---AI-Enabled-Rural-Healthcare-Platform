import { useState, useEffect, useCallback, useRef } from 'react'
import { aiAnalysisService, type AIConsultationAnalysis } from '../services/aiAnalysisService'

export interface UseAIAnalysisOptions {
  videoRef: React.RefObject<HTMLVideoElement>
  enabled?: boolean
  intervalMs?: number
  onHighRisk?: (analysis: AIConsultationAnalysis) => void
}

export interface UseAIAnalysisReturn {
  // Current analysis
  analysis: AIConsultationAnalysis | null
  analysisHistory: AIConsultationAnalysis[]
  
  // State
  isAnalyzing: boolean
  error: Error | null
  
  // Actions
  startAnalysis: () => void
  stopAnalysis: () => void
  getSnapshot: () => Promise<AIConsultationAnalysis | null>
  clearHistory: () => void
}

export function useAIAnalysis(options: UseAIAnalysisOptions): UseAIAnalysisReturn {
  const { videoRef, enabled = false, intervalMs = 3000, onHighRisk } = options

  const [analysis, setAnalysis] = useState<AIConsultationAnalysis | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<AIConsultationAnalysis[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const isRunning = useRef(false)
  const lastHighRiskAlert = useRef<number>(0)

  // Handle analysis result
  const handleAnalysis = useCallback((result: AIConsultationAnalysis) => {
    setAnalysis(result)
    setAnalysisHistory(prev => {
      // Keep last 20 analyses for history
      const updated = [...prev, result]
      return updated.slice(-20)
    })

    // Trigger high risk callback (max once per 30 seconds)
    if (
      (result.riskLevel === 'high' || result.riskLevel === 'critical') &&
      Date.now() - lastHighRiskAlert.current > 30000
    ) {
      lastHighRiskAlert.current = Date.now()
      onHighRisk?.(result)
    }
  }, [onHighRisk])

  // Start analysis
  const startAnalysis = useCallback(() => {
    if (isRunning.current || !videoRef.current) {
      console.log('[useAIAnalysis] Cannot start - already running or no video ref')
      return
    }

    try {
      setError(null)
      setIsAnalyzing(true)
      isRunning.current = true

      aiAnalysisService.startAnalysis(
        videoRef.current,
        handleAnalysis,
        intervalMs
      )

      console.log('[useAIAnalysis] Analysis started')
    } catch (err) {
      console.error('[useAIAnalysis] Failed to start analysis:', err)
      setError(err as Error)
      setIsAnalyzing(false)
      isRunning.current = false
    }
  }, [videoRef, intervalMs, handleAnalysis])

  // Stop analysis
  const stopAnalysis = useCallback(() => {
    aiAnalysisService.stopAnalysis()
    setIsAnalyzing(false)
    isRunning.current = false
    console.log('[useAIAnalysis] Analysis stopped')
  }, [])

  // Get single snapshot
  const getSnapshot = useCallback(async (): Promise<AIConsultationAnalysis | null> => {
    if (!videoRef.current) return null

    try {
      const result = await aiAnalysisService.getSnapshot(videoRef.current)
      if (result) {
        setAnalysis(result)
        setAnalysisHistory(prev => [...prev, result].slice(-20))
      }
      return result
    } catch (err) {
      console.error('[useAIAnalysis] Snapshot error:', err)
      setError(err as Error)
      return null
    }
  }, [videoRef])

  // Clear history
  const clearHistory = useCallback(() => {
    setAnalysisHistory([])
    setAnalysis(null)
  }, [])

  // Auto-start/stop based on enabled flag
  useEffect(() => {
    if (enabled && videoRef.current) {
      // Small delay to ensure video is ready
      const timeout = setTimeout(() => {
        startAnalysis()
      }, 1000)
      return () => clearTimeout(timeout)
    } else {
      stopAnalysis()
    }
  }, [enabled, startAnalysis, stopAnalysis, videoRef])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRunning.current) {
        aiAnalysisService.stopAnalysis()
        isRunning.current = false
      }
    }
  }, [])

  return {
    analysis,
    analysisHistory,
    isAnalyzing,
    error,
    startAnalysis,
    stopAnalysis,
    getSnapshot,
    clearHistory,
  }
}

export default useAIAnalysis
