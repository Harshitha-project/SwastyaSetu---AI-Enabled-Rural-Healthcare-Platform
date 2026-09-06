/**
 * Health Alert Service for SwasthyaSetu
 * Handles government health advisories, disease outbreak notifications, and health warnings
 */

import api from './api'

// Types
export type AlertSeverity = 'INFO' | 'WARNING' | 'ALERT' | 'EMERGENCY'
export type AlertCategory = 
  | 'OUTBREAK'
  | 'WEATHER'
  | 'VACCINATION'
  | 'PREVENTION'
  | 'WATER_QUALITY'
  | 'AIR_QUALITY'
  | 'GOVERNMENT_SCHEME'
  | 'CAMP'
  | 'ADVISORY'

export interface HealthAlert {
  id: string
  title: string
  titleMarathi: string
  message: string
  messageMarathi: string
  severity: AlertSeverity
  category: AlertCategory
  affectedAreas: string[]
  issueDate: string
  expiryDate?: string
  source: string
  sourceUrl?: string
  precautions?: string[]
  precautionsMarathi?: string[]
  symptoms?: string[]
  symptomsMarathi?: string[]
  isActive: boolean
  viewCount?: number
}

export interface DiseaseOutbreak {
  id: string
  diseaseName: string
  diseaseNameMarathi: string
  description: string
  descriptionMarathi: string
  affectedDistricts: string[]
  confirmedCases: number
  recoveredCases: number
  activeCases: number
  severity: AlertSeverity
  transmissionMode: string
  transmissionModeMarathi: string
  preventiveMeasures: string[]
  preventiveMeasuresMarathi: string[]
  symptoms: string[]
  symptomsMarathi: string[]
  reportedDate: string
  lastUpdated: string
  hotspots?: Array<{
    location: string
    cases: number
    latitude?: number
    longitude?: number
  }>
}

export interface HealthCamp {
  id: string
  name: string
  nameMarathi: string
  type: 'VACCINATION' | 'SCREENING' | 'BLOOD_DONATION' | 'EYE_CHECKUP' | 'DENTAL' | 'GENERAL'
  description: string
  descriptionMarathi: string
  date: string
  time: string
  venue: string
  venueMarathi: string
  address: string
  organizer: string
  services: string[]
  servicesMarathi: string[]
  registrationRequired: boolean
  registrationLink?: string
  contactNumber?: string
  isFree: boolean
}

export interface WeatherHealthAdvisory {
  id: string
  type: 'HEATWAVE' | 'COLD_WAVE' | 'FLOOD' | 'STORM' | 'AIR_POLLUTION'
  title: string
  titleMarathi: string
  message: string
  messageMarathi: string
  severity: AlertSeverity
  affectedAreas: string[]
  validFrom: string
  validTo: string
  precautions: string[]
  precautionsMarathi: string[]
  temperature?: {
    current: number
    max: number
    min: number
  }
  airQualityIndex?: number
}

// Mock Health Alerts Data (Maharashtra specific)
const mockHealthAlerts: HealthAlert[] = [
  {
    id: 'alert-1',
    title: 'Dengue Prevention Advisory',
    titleMarathi: 'डेंग्यू प्रतिबंध सल्ला',
    message: 'With the onset of monsoon, dengue cases are rising. Remove stagnant water around homes, use mosquito nets, and wear full-sleeved clothes.',
    messageMarathi: 'पावसाळा सुरू झाल्याने डेंग्यूचे रुग्ण वाढत आहेत. घराभोवती साचलेले पाणी काढा, मच्छरदाणी वापरा आणि पूर्ण बाह्यांचे कपडे घाला.',
    severity: 'ALERT',
    category: 'PREVENTION',
    affectedAreas: ['Satara', 'Pune', 'Kolhapur', 'Sangli'],
    issueDate: '2026-09-01',
    expiryDate: '2026-10-31',
    source: 'Maharashtra Public Health Department',
    precautions: [
      'Remove stagnant water from coolers, pots, and containers',
      'Use mosquito repellent and nets',
      'Wear long-sleeved clothes',
      'Keep surroundings clean',
      'Seek medical help if fever persists for more than 2 days',
    ],
    precautionsMarathi: [
      'कुलर, भांडी आणि कंटेनरमधील साचलेले पाणी काढा',
      'मच्छर प्रतिबंधक आणि जाळी वापरा',
      'पूर्ण बाह्यांचे कपडे घाला',
      'परिसर स्वच्छ ठेवा',
      '२ दिवसांपेक्षा जास्त ताप राहिल्यास डॉक्टरांना भेटा',
    ],
    symptoms: ['High fever', 'Severe headache', 'Pain behind eyes', 'Joint pain', 'Rash'],
    symptomsMarathi: ['तीव्र ताप', 'तीव्र डोकेदुखी', 'डोळ्यांमागे वेदना', 'सांधेदुखी', 'पुरळ'],
    isActive: true,
    viewCount: 1234,
  },
  {
    id: 'alert-2',
    title: 'Monsoon Waterborne Disease Alert',
    titleMarathi: 'पावसाळी जलजन्य आजार सतर्कता',
    message: 'Due to flooding in several areas, there is increased risk of waterborne diseases like cholera, typhoid, and gastroenteritis. Drink only boiled or filtered water.',
    messageMarathi: 'अनेक भागात पूर आल्यामुळे कॉलरा, टायफॉइड आणि जठरांत्रदाह यांसारख्या जलजन्य रोगांचा धोका वाढला आहे. फक्त उकळलेले किंवा फिल्टर केलेले पाणी प्या.',
    severity: 'WARNING',
    category: 'OUTBREAK',
    affectedAreas: ['Sangli', 'Kolhapur', 'Satara'],
    issueDate: '2026-09-03',
    expiryDate: '2026-09-30',
    source: 'District Health Office',
    precautions: [
      'Drink only boiled or filtered water',
      'Avoid street food during monsoon',
      'Wash hands frequently with soap',
      'Keep food covered',
      'Use ORS for dehydration',
    ],
    precautionsMarathi: [
      'फक्त उकळलेले किंवा फिल्टर केलेले पाणी प्या',
      'पावसाळ्यात रस्त्यावरचे अन्न टाळा',
      'वारंवार साबणाने हात धुवा',
      'अन्न झाकून ठेवा',
      'निर्जलीकरणासाठी ORS वापरा',
    ],
    isActive: true,
    viewCount: 856,
  },
  {
    id: 'alert-3',
    title: 'Free COVID-19 Booster Vaccination Camp',
    titleMarathi: 'मोफत कोविड-१९ बूस्टर लसीकरण शिबीर',
    message: 'Free booster doses available at all PHCs and CHCs. Bring Aadhaar card. Priority for senior citizens and healthcare workers.',
    messageMarathi: 'सर्व PHC आणि CHC मध्ये मोफत बूस्टर डोस उपलब्ध. आधार कार्ड आणा. ज्येष्ठ नागरिक आणि आरोग्य कर्मचाऱ्यांना प्राधान्य.',
    severity: 'INFO',
    category: 'VACCINATION',
    affectedAreas: ['All Maharashtra'],
    issueDate: '2026-09-01',
    expiryDate: '2026-09-30',
    source: 'National Health Mission Maharashtra',
    sourceUrl: 'https://arogyasetu.gov.in',
    isActive: true,
    viewCount: 2345,
  },
  {
    id: 'alert-4',
    title: 'Leptospirosis Warning - Flood Affected Areas',
    titleMarathi: 'लेप्टोस्पायरोसिस इशारा - पूरग्रस्त भाग',
    message: 'People wading through flood water are at risk of Leptospirosis (rat fever). Avoid contact with flood water. Wear protective footwear.',
    messageMarathi: 'पुराच्या पाण्यातून चालणाऱ्या लोकांना लेप्टोस्पायरोसिस (उंदीर ताप) चा धोका आहे. पुराच्या पाण्याशी संपर्क टाळा. संरक्षक पादत्राणे घाला.',
    severity: 'ALERT',
    category: 'PREVENTION',
    affectedAreas: ['Sangli', 'Kolhapur'],
    issueDate: '2026-09-05',
    source: 'State Disease Surveillance Unit',
    precautions: [
      'Avoid walking through flood water',
      'Wear gumboots if must walk through water',
      'Wash feet with clean water and soap after exposure',
      'Take prophylactic antibiotics if advised by doctor',
      'Seek immediate care if fever develops after flood exposure',
    ],
    precautionsMarathi: [
      'पुराच्या पाण्यातून चालणे टाळा',
      'पाण्यातून चालायचे असल्यास गमबूट घाला',
      'संपर्कानंतर स्वच्छ पाणी आणि साबणाने पाय धुवा',
      'डॉक्टरांनी सल्ला दिल्यास प्रतिबंधात्मक अँटीबायोटिक्स घ्या',
      'पूर संपर्कानंतर ताप आल्यास तात्काळ वैद्यकीय सेवा घ्या',
    ],
    symptoms: ['High fever', 'Muscle pain', 'Headache', 'Red eyes', 'Jaundice'],
    symptomsMarathi: ['तीव्र ताप', 'स्नायू दुखणे', 'डोकेदुखी', 'लाल डोळे', 'कावीळ'],
    isActive: true,
    viewCount: 678,
  },
  {
    id: 'alert-5',
    title: 'Mahatma Phule Jan Arogya Yojana - New Benefits Added',
    titleMarathi: 'महात्मा फुले जन आरोग्य योजना - नवीन लाभ जोडले',
    message: 'New treatments including knee replacement and cardiac surgeries now covered under MJPJAY. Apply with ration card at any empanelled hospital.',
    messageMarathi: 'गुडघा बदलणे आणि हृदय शस्त्रक्रिया यांसह नवीन उपचार आता MJPJAY अंतर्गत समाविष्ट. कोणत्याही नोंदणीकृत रुग्णालयात रेशन कार्डसह अर्ज करा.',
    severity: 'INFO',
    category: 'GOVERNMENT_SCHEME',
    affectedAreas: ['All Maharashtra'],
    issueDate: '2026-08-15',
    source: 'Government of Maharashtra',
    sourceUrl: 'https://www.jeevandayee.gov.in',
    isActive: true,
    viewCount: 3456,
  },
]

// Mock Disease Outbreaks
const mockOutbreaks: DiseaseOutbreak[] = [
  {
    id: 'outbreak-1',
    diseaseName: 'Dengue Fever',
    diseaseNameMarathi: 'डेंग्यू ताप',
    description: 'Mosquito-borne viral infection causing high fever and severe body pain',
    descriptionMarathi: 'मच्छर-जनित विषाणू संसर्ग ज्यामुळे तीव्र ताप आणि शरीर दुखते',
    affectedDistricts: ['Pune', 'Satara', 'Kolhapur', 'Nashik'],
    confirmedCases: 1245,
    recoveredCases: 890,
    activeCases: 355,
    severity: 'ALERT',
    transmissionMode: 'Aedes mosquito bite',
    transmissionModeMarathi: 'एडीस डासाच्या चाव्याने',
    preventiveMeasures: [
      'Eliminate mosquito breeding sites',
      'Use mosquito repellent',
      'Wear protective clothing',
      'Use bed nets',
    ],
    preventiveMeasuresMarathi: [
      'डास उत्पत्ती स्थान नष्ट करा',
      'मच्छर प्रतिबंधक वापरा',
      'संरक्षक कपडे घाला',
      'मच्छरदाणी वापरा',
    ],
    symptoms: ['High fever', 'Severe headache', 'Pain behind eyes', 'Joint pain', 'Nausea'],
    symptomsMarathi: ['तीव्र ताप', 'तीव्र डोकेदुखी', 'डोळ्यांमागे वेदना', 'सांधेदुखी', 'मळमळ'],
    reportedDate: '2026-07-15',
    lastUpdated: '2026-09-06',
    hotspots: [
      { location: 'Pune City', cases: 456 },
      { location: 'Satara', cases: 234 },
      { location: 'Kolhapur', cases: 312 },
      { location: 'Nashik', cases: 243 },
    ],
  },
  {
    id: 'outbreak-2',
    diseaseName: 'Gastroenteritis',
    diseaseNameMarathi: 'जठरांत्रदाह',
    description: 'Intestinal infection causing diarrhea, vomiting and dehydration',
    descriptionMarathi: 'आतड्यांचा संसर्ग ज्यामुळे जुलाब, उलट्या आणि निर्जलीकरण होते',
    affectedDistricts: ['Sangli', 'Kolhapur'],
    confirmedCases: 342,
    recoveredCases: 280,
    activeCases: 62,
    severity: 'WARNING',
    transmissionMode: 'Contaminated water and food',
    transmissionModeMarathi: 'दूषित पाणी आणि अन्न',
    preventiveMeasures: [
      'Drink boiled water only',
      'Avoid street food',
      'Wash hands before eating',
      'Use ORS for dehydration',
    ],
    preventiveMeasuresMarathi: [
      'फक्त उकळलेले पाणी प्या',
      'रस्त्यावरचे अन्न टाळा',
      'जेवण्यापूर्वी हात धुवा',
      'निर्जलीकरणासाठी ORS वापरा',
    ],
    symptoms: ['Watery diarrhea', 'Vomiting', 'Stomach cramps', 'Fever', 'Weakness'],
    symptomsMarathi: ['पाण्यासारखा जुलाब', 'उलट्या', 'पोटात पेटके', 'ताप', 'अशक्तपणा'],
    reportedDate: '2026-08-20',
    lastUpdated: '2026-09-06',
    hotspots: [
      { location: 'Sangli City', cases: 189 },
      { location: 'Miraj', cases: 98 },
      { location: 'Kolhapur Rural', cases: 55 },
    ],
  },
]

// Mock Health Camps
const mockHealthCamps: HealthCamp[] = [
  {
    id: 'camp-1',
    name: 'Free Eye Checkup Camp',
    nameMarathi: 'मोफत नेत्र तपासणी शिबीर',
    type: 'EYE_CHECKUP',
    description: 'Free eye examination and cataract screening. Free spectacles for eligible patients.',
    descriptionMarathi: 'मोफत नेत्र तपासणी आणि मोतीबिंदू तपासणी. पात्र रुग्णांसाठी मोफत चष्मा.',
    date: '2026-09-15',
    time: '9:00 AM - 4:00 PM',
    venue: 'Zilla Parishad Hall',
    venueMarathi: 'जिल्हा परिषद हॉल',
    address: 'Near Collector Office, Satara',
    organizer: 'District Health Department & Lions Club',
    services: ['Eye examination', 'Cataract screening', 'Free spectacles', 'Referral for surgery'],
    servicesMarathi: ['नेत्र तपासणी', 'मोतीबिंदू तपासणी', 'मोफत चष्मा', 'शस्त्रक्रियेसाठी संदर्भ'],
    registrationRequired: false,
    contactNumber: '02162-234567',
    isFree: true,
  },
  {
    id: 'camp-2',
    name: 'Blood Donation Camp',
    nameMarathi: 'रक्तदान शिबीर',
    type: 'BLOOD_DONATION',
    description: 'Voluntary blood donation camp. All blood groups needed. Certificate provided.',
    descriptionMarathi: 'स्वैच्छिक रक्तदान शिबीर. सर्व रक्तगट आवश्यक. प्रमाणपत्र दिले जाईल.',
    date: '2026-09-10',
    time: '10:00 AM - 5:00 PM',
    venue: 'District Hospital Blood Bank',
    venueMarathi: 'जिल्हा रुग्णालय रक्तपेढी',
    address: 'Civil Lines, Satara',
    organizer: 'Indian Red Cross Society',
    services: ['Blood donation', 'Free health checkup', 'Refreshments', 'Certificate'],
    servicesMarathi: ['रक्तदान', 'मोफत आरोग्य तपासणी', 'जलपान', 'प्रमाणपत्र'],
    registrationRequired: false,
    contactNumber: '02162-234000',
    isFree: true,
  },
  {
    id: 'camp-3',
    name: 'Diabetes Screening Camp',
    nameMarathi: 'मधुमेह तपासणी शिबीर',
    type: 'SCREENING',
    description: 'Free diabetes screening with HbA1c test. Diet counseling for diabetics.',
    descriptionMarathi: 'HbA1c चाचणीसह मोफत मधुमेह तपासणी. मधुमेही रुग्णांसाठी आहार सल्ला.',
    date: '2026-09-20',
    time: '8:00 AM - 2:00 PM',
    venue: 'PHC Phaltan',
    venueMarathi: 'प्राथमिक आरोग्य केंद्र फलटण',
    address: 'PHC Complex, Phaltan',
    organizer: 'NCD Program, Health Department',
    services: ['Blood sugar test', 'HbA1c test', 'BP checkup', 'Diet counseling', 'Free medicines'],
    servicesMarathi: ['रक्त शर्करा तपासणी', 'HbA1c चाचणी', 'बीपी तपासणी', 'आहार सल्ला', 'मोफत औषधे'],
    registrationRequired: true,
    registrationLink: 'https://ncdscreening.gov.in',
    contactNumber: '02166-222333',
    isFree: true,
  },
]

// Mock Weather Advisory
const mockWeatherAdvisory: WeatherHealthAdvisory | null = {
  id: 'weather-1',
  type: 'FLOOD',
  title: 'Heavy Rainfall Warning',
  titleMarathi: 'मुसळधार पावसाचा इशारा',
  message: 'IMD has issued orange alert for Satara, Sangli, and Kolhapur districts. Expect heavy to very heavy rainfall in next 48 hours.',
  messageMarathi: 'IMD ने सातारा, सांगली आणि कोल्हापूर जिल्ह्यांसाठी नारंगी सतर्कता जारी केली आहे. पुढील 48 तासांत मुसळधार ते अतिमुसळधार पावसाची शक्यता.',
  severity: 'WARNING',
  affectedAreas: ['Satara', 'Sangli', 'Kolhapur'],
  validFrom: '2026-09-06',
  validTo: '2026-09-08',
  precautions: [
    'Avoid unnecessary travel',
    'Stay away from rivers and streams',
    'Keep emergency kit ready',
    'Follow local authorities instructions',
    'Keep mobile phones charged',
  ],
  precautionsMarathi: [
    'अनावश्यक प्रवास टाळा',
    'नद्या आणि नाल्यांपासून दूर राहा',
    'आणीबाणी किट तयार ठेवा',
    'स्थानिक अधिकाऱ्यांच्या सूचनांचे पालन करा',
    'मोबाइल फोन चार्ज ठेवा',
  ],
}

class HealthAlertService {
  /**
   * Get all active health alerts
   */
  async getActiveAlerts(district?: string): Promise<HealthAlert[]> {
    try {
      // In production, call API
      // const response = await api.get('/health-alerts', { params: { district } })
      // return response.data.data

      let alerts = mockHealthAlerts.filter(a => a.isActive)
      
      if (district) {
        alerts = alerts.filter(a => 
          a.affectedAreas.includes(district) || 
          a.affectedAreas.includes('All Maharashtra')
        )
      }
      
      return alerts.sort((a, b) => {
        const severityOrder = { EMERGENCY: 0, ALERT: 1, WARNING: 2, INFO: 3 }
        return severityOrder[a.severity] - severityOrder[b.severity]
      })
    } catch (error) {
      console.error('Error fetching health alerts:', error)
      return []
    }
  }

  /**
   * Get disease outbreaks
   */
  async getOutbreaks(district?: string): Promise<DiseaseOutbreak[]> {
    try {
      // In production, call API
      let outbreaks = [...mockOutbreaks]
      
      if (district) {
        outbreaks = outbreaks.filter(o => o.affectedDistricts.includes(district))
      }
      
      return outbreaks.sort((a, b) => {
        const severityOrder = { EMERGENCY: 0, ALERT: 1, WARNING: 2, INFO: 3 }
        return severityOrder[a.severity] - severityOrder[b.severity]
      })
    } catch (error) {
      console.error('Error fetching outbreaks:', error)
      return []
    }
  }

  /**
   * Get upcoming health camps
   */
  async getHealthCamps(district?: string, type?: string): Promise<HealthCamp[]> {
    try {
      let camps = [...mockHealthCamps]
      
      // Filter future camps only
      const today = new Date().toISOString().split('T')[0]
      camps = camps.filter(c => c.date >= today)
      
      return camps.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } catch (error) {
      console.error('Error fetching health camps:', error)
      return []
    }
  }

  /**
   * Get weather health advisory
   */
  async getWeatherAdvisory(district?: string): Promise<WeatherHealthAdvisory | null> {
    try {
      // In production, call weather API
      if (mockWeatherAdvisory) {
        if (district && !mockWeatherAdvisory.affectedAreas.includes(district)) {
          return null
        }
        return mockWeatherAdvisory
      }
      return null
    } catch (error) {
      console.error('Error fetching weather advisory:', error)
      return null
    }
  }

  /**
   * Get alert by ID
   */
  async getAlertById(id: string): Promise<HealthAlert | null> {
    const alert = mockHealthAlerts.find(a => a.id === id)
    return alert || null
  }

  /**
   * Get outbreak by ID
   */
  async getOutbreakById(id: string): Promise<DiseaseOutbreak | null> {
    const outbreak = mockOutbreaks.find(o => o.id === id)
    return outbreak || null
  }

  /**
   * Mark alert as read (for tracking)
   */
  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      // In production, call API
      // await api.post(`/health-alerts/${alertId}/read`)
      const alert = mockHealthAlerts.find(a => a.id === alertId)
      if (alert) {
        alert.viewCount = (alert.viewCount || 0) + 1
      }
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  /**
   * Subscribe to alerts for a district
   */
  async subscribeToAlerts(district: string, phone: string): Promise<boolean> {
    try {
      // In production, call API to register for SMS alerts
      // await api.post('/health-alerts/subscribe', { district, phone })
      return true
    } catch (error) {
      console.error('Error subscribing to alerts:', error)
      return false
    }
  }

  /**
   * Get severity color for UI
   */
  getSeverityColor(severity: AlertSeverity): string {
    const colors = {
      EMERGENCY: 'bg-red-500 text-white',
      ALERT: 'bg-orange-500 text-white',
      WARNING: 'bg-yellow-500 text-black',
      INFO: 'bg-blue-500 text-white',
    }
    return colors[severity] || colors.INFO
  }

  /**
   * Get severity badge variant
   */
  getSeverityVariant(severity: AlertSeverity): 'destructive' | 'default' | 'secondary' | 'outline' {
    const variants: Record<AlertSeverity, 'destructive' | 'default' | 'secondary' | 'outline'> = {
      EMERGENCY: 'destructive',
      ALERT: 'destructive',
      WARNING: 'default',
      INFO: 'secondary',
    }
    return variants[severity] || 'secondary'
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category: AlertCategory): string {
    const icons: Record<AlertCategory, string> = {
      OUTBREAK: '🦠',
      WEATHER: '🌧️',
      VACCINATION: '💉',
      PREVENTION: '🛡️',
      WATER_QUALITY: '💧',
      AIR_QUALITY: '🌫️',
      GOVERNMENT_SCHEME: '🏛️',
      CAMP: '🏕️',
      ADVISORY: '📢',
    }
    return icons[category] || '📋'
  }
}

export const healthAlertService = new HealthAlertService()
export default healthAlertService
