/**
 * Real-time AI Analysis Service for Teleconsultation
 * Provides facial analysis, vitals estimation, and symptom detection
 */

export interface FacialAnalysis {
  skinTone: 'normal' | 'pale' | 'flushed' | 'jaundiced'
  eyeCondition: 'normal' | 'red' | 'yellowish' | 'droopy'
  facialExpression: 'relaxed' | 'distressed' | 'fatigued' | 'pain'
  hydrationLevel: 'good' | 'mild_dehydration' | 'moderate_dehydration'
  respiratoryPattern: 'normal' | 'rapid' | 'labored' | 'irregular'
  confidence: number
}

export interface VitalsEstimate {
  heartRate: number
  heartRateStatus: 'normal' | 'low' | 'elevated' | 'high'
  respiratoryRate: number
  respiratoryStatus: 'normal' | 'slow' | 'rapid'
  stressLevel: 'low' | 'moderate' | 'high'
  oxygenEstimate: number // SpO2 estimate based on skin color
  temperature: 'normal' | 'possibly_elevated' | 'likely_fever'
  confidence: number
}

export interface SymptomIndicator {
  symptom: string
  severity: 'mild' | 'moderate' | 'severe'
  confidence: number
  visualCues: string[]
}

export interface AIConsultationAnalysis {
  timestamp: number
  facialAnalysis: FacialAnalysis
  vitalsEstimate: VitalsEstimate
  detectedSymptoms: SymptomIndicator[]
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
  riskScore: number
  recommendations: string[]
  alertFlags: string[]
}

// Simulated AI analysis (in production, this would connect to ML models)
class AIAnalysisService {
  private analysisInterval: ReturnType<typeof setInterval> | null = null
  private videoElement: HTMLVideoElement | null = null
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private onAnalysisCallback: ((analysis: AIConsultationAnalysis) => void) | null = null
  private frameCount: number = 0
  private baselineEstablished: boolean = false
  private baselineData: { brightness: number; redness: number } = { brightness: 128, redness: 0.5 }

  /**
   * Start real-time AI analysis on video stream
   */
  startAnalysis(
    videoElement: HTMLVideoElement,
    onAnalysis: (analysis: AIConsultationAnalysis) => void,
    intervalMs: number = 3000
  ): void {
    this.stopAnalysis()
    
    this.videoElement = videoElement
    this.onAnalysisCallback = onAnalysis
    this.frameCount = 0
    this.baselineEstablished = false

    // Create canvas for frame analysis
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })

    console.log('[AIAnalysis] Starting real-time analysis')

    // Run analysis at specified interval
    this.analysisInterval = setInterval(() => {
      this.analyzeFrame()
    }, intervalMs)

    // Run initial analysis after short delay
    setTimeout(() => this.analyzeFrame(), 500)
  }

  /**
   * Stop the analysis
   */
  stopAnalysis(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval)
      this.analysisInterval = null
    }
    this.videoElement = null
    this.canvas = null
    this.ctx = null
    this.onAnalysisCallback = null
    console.log('[AIAnalysis] Analysis stopped')
  }

  /**
   * Analyze a single video frame
   */
  private analyzeFrame(): void {
    if (!this.videoElement || !this.canvas || !this.ctx || !this.onAnalysisCallback) {
      return
    }

    // Check if video is playing
    if (this.videoElement.readyState < 2 || this.videoElement.paused) {
      console.log('[AIAnalysis] Video not ready, skipping frame')
      return
    }

    this.frameCount++

    try {
      // Set canvas size to match video
      const width = this.videoElement.videoWidth || 640
      const height = this.videoElement.videoHeight || 480
      this.canvas.width = width
      this.canvas.height = height

      // Draw video frame to canvas
      this.ctx.drawImage(this.videoElement, 0, 0, width, height)

      // Get image data for analysis
      const imageData = this.ctx.getImageData(0, 0, width, height)
      const frameMetrics = this.analyzeImageData(imageData)

      // Establish baseline from first few frames
      if (this.frameCount <= 3) {
        this.baselineData.brightness = (this.baselineData.brightness + frameMetrics.brightness) / 2
        this.baselineData.redness = (this.baselineData.redness + frameMetrics.redness) / 2
        if (this.frameCount === 3) {
          this.baselineEstablished = true
          console.log('[AIAnalysis] Baseline established:', this.baselineData)
        }
      }

      // Generate AI analysis based on frame metrics
      const analysis = this.generateAnalysis(frameMetrics)
      this.onAnalysisCallback(analysis)

    } catch (error) {
      console.error('[AIAnalysis] Frame analysis error:', error)
    }
  }

  /**
   * Analyze image data to extract visual metrics
   */
  private analyzeImageData(imageData: ImageData): {
    brightness: number
    redness: number
    yellowness: number
    movement: number
    faceDetected: boolean
  } {
    const data = imageData.data
    let totalR = 0, totalG = 0, totalB = 0
    const pixelCount = data.length / 4

    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      totalR += data[i]
      totalG += data[i + 1]
      totalB += data[i + 2]
    }

    const sampledCount = pixelCount / 10
    const avgR = totalR / sampledCount
    const avgG = totalG / sampledCount
    const avgB = totalB / sampledCount

    const brightness = (avgR + avgG + avgB) / 3
    const redness = avgR / (avgG + avgB + 1)
    const yellowness = (avgR + avgG) / (avgB * 2 + 1)

    // Simple movement detection based on brightness variance
    const movement = Math.abs(brightness - this.baselineData.brightness) / 255

    return {
      brightness,
      redness,
      yellowness,
      movement,
      faceDetected: brightness > 30 && brightness < 240, // Basic presence detection
    }
  }

  /**
   * Generate comprehensive AI analysis from frame metrics
   */
  private generateAnalysis(metrics: {
    brightness: number
    redness: number
    yellowness: number
    movement: number
    faceDetected: boolean
  }): AIConsultationAnalysis {
    const now = Date.now()

    // Facial Analysis
    const facialAnalysis = this.analyzeFacialFeatures(metrics)

    // Vitals Estimation (simulated with realistic variance)
    const vitalsEstimate = this.estimateVitals(metrics)

    // Symptom Detection
    const detectedSymptoms = this.detectSymptoms(facialAnalysis, vitalsEstimate)

    // Calculate overall risk
    const { riskLevel, riskScore, recommendations, alertFlags } = this.calculateRisk(
      facialAnalysis,
      vitalsEstimate,
      detectedSymptoms
    )

    return {
      timestamp: now,
      facialAnalysis,
      vitalsEstimate,
      detectedSymptoms,
      riskLevel,
      riskScore,
      recommendations,
      alertFlags,
    }
  }

  /**
   * Analyze facial features from image metrics
   */
  private analyzeFacialFeatures(metrics: {
    brightness: number
    redness: number
    yellowness: number
    movement: number
    faceDetected: boolean
  }): FacialAnalysis {
    // Determine skin tone based on color analysis
    let skinTone: FacialAnalysis['skinTone'] = 'normal'
    if (metrics.brightness < 80) skinTone = 'pale'
    else if (metrics.redness > 0.6) skinTone = 'flushed'
    else if (metrics.yellowness > 1.2) skinTone = 'jaundiced'

    // Eye condition (simulated - would use ML in production)
    const eyeCondition: FacialAnalysis['eyeCondition'] = 
      metrics.yellowness > 1.3 ? 'yellowish' : 
      metrics.redness > 0.7 ? 'red' : 'normal'

    // Facial expression based on movement patterns
    let facialExpression: FacialAnalysis['facialExpression'] = 'relaxed'
    if (metrics.movement > 0.15) facialExpression = 'distressed'
    else if (metrics.brightness < 100) facialExpression = 'fatigued'

    // Hydration estimation
    const hydrationLevel: FacialAnalysis['hydrationLevel'] = 
      metrics.brightness < 90 ? 'moderate_dehydration' :
      metrics.brightness < 110 ? 'mild_dehydration' : 'good'

    // Respiratory pattern (simulated based on movement)
    let respiratoryPattern: FacialAnalysis['respiratoryPattern'] = 'normal'
    if (metrics.movement > 0.2) respiratoryPattern = 'rapid'
    else if (metrics.movement > 0.25) respiratoryPattern = 'labored'

    return {
      skinTone,
      eyeCondition,
      facialExpression,
      hydrationLevel,
      respiratoryPattern,
      confidence: metrics.faceDetected ? 0.75 + Math.random() * 0.15 : 0.3,
    }
  }

  /**
   * Estimate vital signs from visual analysis
   */
  private estimateVitals(metrics: {
    brightness: number
    redness: number
    movement: number
    faceDetected: boolean
  }): VitalsEstimate {
    // Heart rate estimation (60-100 normal, simulated with variance)
    const baseHR = 72 + (metrics.redness - 0.5) * 40 + (Math.random() - 0.5) * 10
    const heartRate = Math.round(Math.max(55, Math.min(120, baseHR)))
    
    let heartRateStatus: VitalsEstimate['heartRateStatus'] = 'normal'
    if (heartRate < 60) heartRateStatus = 'low'
    else if (heartRate > 100) heartRateStatus = 'high'
    else if (heartRate > 90) heartRateStatus = 'elevated'

    // Respiratory rate (12-20 normal)
    const baseRR = 16 + metrics.movement * 20 + (Math.random() - 0.5) * 4
    const respiratoryRate = Math.round(Math.max(10, Math.min(30, baseRR)))
    
    let respiratoryStatus: VitalsEstimate['respiratoryStatus'] = 'normal'
    if (respiratoryRate < 12) respiratoryStatus = 'slow'
    else if (respiratoryRate > 20) respiratoryStatus = 'rapid'

    // Stress level based on combined factors
    const stressScore = (heartRate - 60) / 40 + metrics.movement * 2
    let stressLevel: VitalsEstimate['stressLevel'] = 'low'
    if (stressScore > 1.5) stressLevel = 'high'
    else if (stressScore > 0.8) stressLevel = 'moderate'

    // SpO2 estimate (95-100 normal)
    const oxygenEstimate = Math.round(Math.max(88, Math.min(100, 97 + (metrics.brightness - 128) / 50 + (Math.random() - 0.5) * 2)))

    // Temperature indicator
    let temperature: VitalsEstimate['temperature'] = 'normal'
    if (metrics.redness > 0.65) temperature = 'likely_fever'
    else if (metrics.redness > 0.55) temperature = 'possibly_elevated'

    return {
      heartRate,
      heartRateStatus,
      respiratoryRate,
      respiratoryStatus,
      stressLevel,
      oxygenEstimate,
      temperature,
      confidence: metrics.faceDetected ? 0.65 + Math.random() * 0.2 : 0.25,
    }
  }

  /**
   * Detect symptoms based on facial and vital analysis
   */
  private detectSymptoms(
    facial: FacialAnalysis,
    vitals: VitalsEstimate
  ): SymptomIndicator[] {
    const symptoms: SymptomIndicator[] = []

    // Fever indicators
    if (vitals.temperature !== 'normal' || facial.skinTone === 'flushed') {
      symptoms.push({
        symptom: 'Possible Fever',
        severity: vitals.temperature === 'likely_fever' ? 'moderate' : 'mild',
        confidence: 0.7,
        visualCues: ['Flushed skin', 'Elevated skin temperature appearance'],
      })
    }

    // Respiratory distress
    if (facial.respiratoryPattern !== 'normal' || vitals.respiratoryRate > 22) {
      symptoms.push({
        symptom: 'Respiratory Distress',
        severity: facial.respiratoryPattern === 'labored' ? 'severe' : 'moderate',
        confidence: 0.75,
        visualCues: ['Rapid breathing', 'Visible chest movement'],
      })
    }

    // Dehydration
    if (facial.hydrationLevel !== 'good') {
      symptoms.push({
        symptom: 'Dehydration Signs',
        severity: facial.hydrationLevel === 'moderate_dehydration' ? 'moderate' : 'mild',
        confidence: 0.6,
        visualCues: ['Dry skin appearance', 'Reduced skin elasticity indicators'],
      })
    }

    // Fatigue/Weakness
    if (facial.facialExpression === 'fatigued' || facial.eyeCondition === 'droopy') {
      symptoms.push({
        symptom: 'Fatigue/Weakness',
        severity: 'mild',
        confidence: 0.65,
        visualCues: ['Tired facial expression', 'Reduced alertness'],
      })
    }

    // Jaundice indicators
    if (facial.skinTone === 'jaundiced' || facial.eyeCondition === 'yellowish') {
      symptoms.push({
        symptom: 'Possible Jaundice',
        severity: 'moderate',
        confidence: 0.55,
        visualCues: ['Yellowish skin tint', 'Yellow sclera appearance'],
      })
    }

    // Low oxygen
    if (vitals.oxygenEstimate < 94) {
      symptoms.push({
        symptom: 'Low Oxygen Saturation',
        severity: vitals.oxygenEstimate < 90 ? 'severe' : 'moderate',
        confidence: 0.6,
        visualCues: ['Pale or bluish skin tint'],
      })
    }

    // Pain/Distress
    if (facial.facialExpression === 'distressed' || facial.facialExpression === 'pain') {
      symptoms.push({
        symptom: 'Signs of Discomfort/Pain',
        severity: 'moderate',
        confidence: 0.7,
        visualCues: ['Distressed facial expression', 'Grimacing'],
      })
    }

    return symptoms
  }

  /**
   * Calculate overall risk level and generate recommendations
   */
  private calculateRisk(
    facial: FacialAnalysis,
    vitals: VitalsEstimate,
    symptoms: SymptomIndicator[]
  ): {
    riskLevel: AIConsultationAnalysis['riskLevel']
    riskScore: number
    recommendations: string[]
    alertFlags: string[]
  } {
    let riskScore = 0
    const recommendations: string[] = []
    const alertFlags: string[] = []

    // Score based on vitals
    if (vitals.heartRateStatus === 'high') riskScore += 20
    else if (vitals.heartRateStatus === 'elevated') riskScore += 10

    if (vitals.respiratoryStatus === 'rapid') riskScore += 15

    if (vitals.oxygenEstimate < 90) riskScore += 30
    else if (vitals.oxygenEstimate < 94) riskScore += 15

    if (vitals.temperature === 'likely_fever') riskScore += 15
    else if (vitals.temperature === 'possibly_elevated') riskScore += 8

    // Score based on symptoms
    for (const symptom of symptoms) {
      if (symptom.severity === 'severe') riskScore += 20
      else if (symptom.severity === 'moderate') riskScore += 10
      else riskScore += 5
    }

    // Determine risk level
    let riskLevel: AIConsultationAnalysis['riskLevel'] = 'low'
    if (riskScore >= 60) riskLevel = 'critical'
    else if (riskScore >= 40) riskLevel = 'high'
    else if (riskScore >= 20) riskLevel = 'moderate'

    // Generate recommendations
    if (vitals.oxygenEstimate < 94) {
      recommendations.push('Monitor oxygen saturation closely')
      alertFlags.push('Low SpO2 detected')
    }

    if (vitals.temperature !== 'normal') {
      recommendations.push('Check body temperature with thermometer')
    }

    if (vitals.heartRateStatus !== 'normal') {
      recommendations.push('Monitor heart rate and blood pressure')
    }

    if (facial.hydrationLevel !== 'good') {
      recommendations.push('Increase fluid intake')
    }

    if (symptoms.some(s => s.symptom.includes('Respiratory'))) {
      recommendations.push('Assess breathing difficulty severity')
      alertFlags.push('Respiratory symptoms present')
    }

    if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('Consider immediate in-person evaluation')
      alertFlags.push(`${riskLevel.toUpperCase()} RISK - Requires attention`)
    }

    // Cap risk score at 100
    riskScore = Math.min(100, riskScore)

    return { riskLevel, riskScore, recommendations, alertFlags }
  }

  /**
   * Get a one-time analysis snapshot
   */
  async getSnapshot(videoElement: HTMLVideoElement): Promise<AIConsultationAnalysis | null> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      
      if (!ctx || videoElement.readyState < 2) {
        resolve(null)
        return
      }

      const width = videoElement.videoWidth || 640
      const height = videoElement.videoHeight || 480
      canvas.width = width
      canvas.height = height

      ctx.drawImage(videoElement, 0, 0, width, height)
      const imageData = ctx.getImageData(0, 0, width, height)
      const metrics = this.analyzeImageData(imageData)
      const analysis = this.generateAnalysis(metrics)
      
      resolve(analysis)
    })
  }
}

// Export singleton instance
export const aiAnalysisService = new AIAnalysisService()

// Export types
export type { AIConsultationAnalysis as AIAnalysis }
