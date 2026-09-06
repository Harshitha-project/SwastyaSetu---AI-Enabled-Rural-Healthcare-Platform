import api from './api'
import type { AIAssessment, ApiResponse } from '../types'

export interface VitalsInput {
  heartRate?: number | string
  systolic?: number | string
  diastolic?: number | string
  temperature?: number | string
  spo2?: number | string
  glucose?: number | string
}

export interface AssessmentRequest {
  symptoms: string[]
  vitals: VitalsInput
  additionalInfo?: {
    age?: number
    gender?: string
    chronicConditions?: string[]
    allergies?: string[]
  }
}

export interface AIAnalysisResult {
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  riskScore: number // 0 - 100
  indicators: Array<{
    name: string
    status: 'normal' | 'abnormal' | 'critical'
    value?: string
    message?: string
  }>
  recommendation: string
  disclaimer: {
    en: string
    mr: string
    hi: string
  }
  possibleConditions?: string[]
  createdAt?: string
}

const MEDICAL_DISCLAIMER = {
  en: 'AI-assisted preliminary risk assessment – professional doctor evaluation required. In emergency, call 112 immediately.',
  mr: 'हे AI-सहाय्यित प्राथमिक जोखीम मूल्यांकन आहे – डॉक्टरांचे मूल्यांकन आवश्यक आहे. आपत्कालीन परिस्थितीत त्वरित 112 वर संपर्क साधा.',
  hi: 'यह AI-सहायक प्रारंभिक जोखिम मूल्यांकन है – डॉक्टर का मूल्यांकन आवश्यक है। आपातकालीन स्थिति में तुरंत 112 पर कॉल करें।',
}

export const aiService = {
  // Submit complete AI assessment with symptoms and vitals
  async assessHealthRisk(data: AssessmentRequest): Promise<AIAnalysisResult> {
    try {
      const res = await api.post<ApiResponse<any>>('/ai/assessment', data)
      if (res.data?.data) {
        const item = res.data.data
        return {
          riskLevel: item.riskLevel || item.assessment?.riskLevel || 'MODERATE',
          riskScore: item.riskScore || item.assessment?.riskScore || 50,
          indicators: item.indicators || item.assessment?.indicators || [],
          recommendation: item.recommendations || item.assessment?.recommendation || 'Consult a healthcare professional for clinical examination.',
          disclaimer: item.disclaimer || MEDICAL_DISCLAIMER,
          possibleConditions: item.possibleConditions || [],
          createdAt: new Date().toISOString(),
        }
      }
    } catch (err) {
      console.warn('API assessHealthRisk fallback to local rules', err)
    }

    // Intelligent local clinical assessment fallback
    const symptoms = data.symptoms.map(s => s.toLowerCase())
    const vitals = data.vitals

    const indicators: AIAnalysisResult['indicators'] = []
    let riskPoints = 0

    // Vitals analysis
    const hr = Number(vitals.heartRate)
    if (hr) {
      if (hr > 130 || hr < 45) {
        indicators.push({ name: 'Heart Rate', status: 'critical', value: `${hr} bpm`, message: 'Severe tachycardia or bradycardia detected.' })
        riskPoints += 35
      } else if (hr > 100 || hr < 60) {
        indicators.push({ name: 'Heart Rate', status: 'abnormal', value: `${hr} bpm`, message: 'Heart rate outside resting normal range (60-100 bpm).' })
        riskPoints += 15
      } else {
        indicators.push({ name: 'Heart Rate', status: 'normal', value: `${hr} bpm` })
      }
    }

    const spo2 = Number(vitals.spo2)
    if (spo2) {
      if (spo2 < 90) {
        indicators.push({ name: 'Blood Oxygen (SpO₂)', status: 'critical', value: `${spo2}%`, message: 'Dangerously low oxygen saturation! Emergency medical attention required.' })
        riskPoints += 45
      } else if (spo2 < 95) {
        indicators.push({ name: 'Blood Oxygen (SpO₂)', status: 'abnormal', value: `${spo2}%`, message: 'Borderline low oxygen level. Continuous monitoring advised.' })
        riskPoints += 20
      } else {
        indicators.push({ name: 'Blood Oxygen (SpO₂)', status: 'normal', value: `${spo2}%` })
      }
    }

    const sys = Number(vitals.systolic)
    const dia = Number(vitals.diastolic)
    if (sys && dia) {
      if (sys >= 180 || dia >= 110) {
        indicators.push({ name: 'Blood Pressure', status: 'critical', value: `${sys}/${dia} mmHg`, message: 'Hypertensive crisis range! Seek urgent clinical attention.' })
        riskPoints += 40
      } else if (sys >= 140 || dia >= 90) {
        indicators.push({ name: 'Blood Pressure', status: 'abnormal', value: `${sys}/${dia} mmHg`, message: 'Elevated Stage 2 Hypertension range.' })
        riskPoints += 20
      } else if (sys <= 90 || dia <= 60) {
        indicators.push({ name: 'Blood Pressure', status: 'abnormal', value: `${sys}/${dia} mmHg`, message: 'Low blood pressure (Hypotension).' })
        riskPoints += 15
      } else {
        indicators.push({ name: 'Blood Pressure', status: 'normal', value: `${sys}/${dia} mmHg` })
      }
    }

    const temp = Number(vitals.temperature)
    if (temp) {
      if (temp >= 103) {
        indicators.push({ name: 'Temperature', status: 'critical', value: `${temp}°F`, message: 'High-grade fever.' })
        riskPoints += 25
      } else if (temp >= 100) {
        indicators.push({ name: 'Temperature', status: 'abnormal', value: `${temp}°F`, message: 'Moderate fever.' })
        riskPoints += 15
      } else {
        indicators.push({ name: 'Temperature', status: 'normal', value: `${temp}°F` })
      }
    }

    // High risk symptom patterns
    const highRiskSymptoms = ['chest pain', 'breathlessness', 'shortness of breath', 'loss of consciousness', 'severe dizziness', 'blurred vision']
    const flaggedHighRisk = symptoms.filter(s => highRiskSymptoms.some(h => s.includes(h)))
    if (flaggedHighRisk.length > 0) {
      indicators.push({
        name: 'Urgent Symptoms',
        status: 'critical',
        value: flaggedHighRisk.join(', '),
        message: 'Reported symptoms require prompt medical review.',
      })
      riskPoints += 35
    }

    // Common rural syndrome patterns
    const possibleConditions: string[] = []
    if (symptoms.includes('fever') && (symptoms.includes('body pain') || symptoms.includes('joint pain') || symptoms.includes('headache'))) {
      possibleConditions.push('Viral Pyrexia / Vector-borne fever (Dengue / Malaria screening advised)')
    }
    if (symptoms.includes('cough') && (symptoms.includes('cold') || symptoms.includes('sore throat'))) {
      possibleConditions.push('Upper Respiratory Tract Infection (URTI)')
    }
    if (symptoms.includes('vomiting') || symptoms.includes('diarrhea') || symptoms.includes('abdominal pain')) {
      possibleConditions.push('Acute Gastroenteritis / Food contamination')
    }

    // Add count contribution
    riskPoints += Math.min(25, symptoms.length * 5)

    const riskScore = Math.min(100, Math.max(10, riskPoints))
    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW'
    let recommendation = 'Your parameters appear stable. Maintain hydration and monitor symptoms.'

    if (riskScore >= 60 || indicators.some(i => i.status === 'critical')) {
      riskLevel = 'HIGH'
      recommendation = 'High preliminary risk detected. Please consult a doctor immediately or visit your nearest Primary Health Centre (PHC).'
    } else if (riskScore >= 30) {
      riskLevel = 'MODERATE'
      recommendation = 'Moderate concerns detected. We recommend booking a teleconsultation with a doctor within 24-48 hours.'
    }

    const result: AIAnalysisResult = {
      riskLevel,
      riskScore,
      indicators,
      recommendation,
      disclaimer: MEDICAL_DISCLAIMER,
      possibleConditions,
      createdAt: new Date().toISOString(),
    }

    // Save to local assessments history
    try {
      const historyRaw = localStorage.getItem('swasthyasetu_assessments')
      const history = historyRaw ? JSON.parse(historyRaw) : []
      history.unshift({ ...result, symptoms: data.symptoms, id: `asmt-${Date.now()}` })
      localStorage.setItem('swasthyasetu_assessments', JSON.stringify(history.slice(0, 20)))
    } catch (e) {
      console.error(e)
    }

    return result
  },

  // Get previous assessment history for patient
  async getAssessmentHistory(): Promise<any[]> {
    try {
      const res = await api.get<ApiResponse<any[]>>('/ai/assessments/me')
      if (res.data?.data && res.data.data.length > 0) return res.data.data
    } catch (err) {
      console.warn('API getAssessmentHistory fallback to local', err)
    }
    try {
      const raw = localStorage.getItem('swasthyasetu_assessments')
      if (raw) return JSON.parse(raw)
    } catch (e) {
      console.error(e)
    }
    return [
      {
        id: 'asmt-prev-1',
        riskLevel: 'LOW',
        riskScore: 22,
        symptoms: ['Mild Headache', 'Fatigue'],
        recommendation: 'Rest well, drink adequate fluids and monitor screen time.',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      }
    ]
  },

  // Quick symptom check
  async quickSymptomCheck(symptoms: string[]): Promise<any> {
    try {
      const res = await api.post('/ai/symptom-check', { symptoms })
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API quickSymptomCheck fallback', err)
    }
    return {
      symptomCount: symptoms.length,
      categorySummary: 'Respiratory / General',
      recommendation: 'Please provide vital signs for a comprehensive preliminary assessment.',
    }
  },

  // Mental Health & Stress Assessment (PHQ-4 standard)
  calculateStressScore(responses: number[]): { score: number; level: 'Low' | 'Mild' | 'Moderate' | 'High'; advice: string } {
    const total = responses.reduce((a, b) => a + b, 0)
    if (total <= 2) {
      return { score: total, level: 'Low', advice: 'Your stress level is currently well-managed. Continue healthy lifestyle habits and regular sleep.' }
    } else if (total <= 5) {
      return { score: total, level: 'Mild', advice: 'Mild anxiety or stress observed. Regular exercise, mindfulness, and speaking with family can be beneficial.' }
    } else if (total <= 8) {
      return { score: total, level: 'Moderate', advice: 'Moderate stress detected. Consider discussing with a counselor or physician during your next consultation.' }
    } else {
      return { score: total, level: 'High', advice: 'Elevated stress levels detected. Speaking with a mental health professional or doctor is strongly recommended.' }
    }
  },

  // Nutrition & Dietary guidance based on conditions
  getNutritionRecommendations(condition: string, age?: number): string[] {
    const c = condition.toLowerCase()
    if (c.includes('diabet')) {
      return [
        'Prioritize complex carbohydrates: brown rice, whole wheat, jowar, bajra',
        'Incorporate high-fiber green leafy vegetables (spinach, fenugreek, okra)',
        'Avoid refined sugar, jaggery, sugary tea, and processed bakery items',
        'Eat small, frequent meals rather than heavy portions',
        'Include protein: lentils, sprouts, boiled eggs or paneer in each meal',
      ]
    }
    if (c.includes('hyper') || c.includes('bp') || c.includes('pressure')) {
      return [
        'Strictly limit daily sodium/salt intake (less than 1 level teaspoon per day)',
        'Avoid papad, pickles, salted snacks, and instant noodles',
        'Increase potassium-rich fresh fruits: bananas, papayas, and oranges',
        'Maintain daily hydration with 2.5–3 liters of water',
        'Incorporate light physical activity like 30 minutes of brisk walking',
      ]
    }
    if (c.includes('maternal') || c.includes('pregnan')) {
      return [
        'Ensure daily intake of iron & folic acid rich foods: jaggery with roasted chana, drumstick leaves, pomegranate',
        'Consume calcium sources: milk, curd, ragi (finger millet)',
        'Stay well-hydrated throughout the day',
        'Ensure all water is boiled and food is freshly cooked and hygienic',
      ]
    }
    return [
      'Eat balanced home-cooked meals including seasonal regional vegetables',
      'Drink 8-10 glasses of clean, safe drinking water daily',
      'Include traditional pulses, lentils, and millets for dietary fiber and minerals',
      'Limit deep-fried foods and excess refined cooking oil',
    ]
  }
}
