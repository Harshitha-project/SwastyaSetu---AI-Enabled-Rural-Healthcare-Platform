/**
 * Emergency Service for SwasthyaSetu
 * Handles SOS alerts, emergency contacts, geolocation, and alert dispatch
 */

import api from './api'

// Emergency Types
export type EmergencyType = 
  | 'MEDICAL'
  | 'ACCIDENT'
  | 'CARDIAC'
  | 'PREGNANCY'
  | 'SNAKEBITE'
  | 'DROWNING'
  | 'POISONING'
  | 'BREATHING'
  | 'BURN'
  | 'OTHER'

export type EmergencySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type AlertStatus = 'PENDING' | 'DISPATCHED' | 'EN_ROUTE' | 'ARRIVED' | 'RESOLVED' | 'CANCELLED'

// Interfaces
export interface EmergencyContact {
  id: string
  name: string
  nameMarathi?: string
  number: string
  type: 'AMBULANCE' | 'HOSPITAL' | 'POLICE' | 'FIRE' | 'BLOOD_BANK' | 'POISON_CONTROL' | 'WOMEN_HELPLINE' | 'CHILD_HELPLINE' | 'DISASTER' | 'OTHER'
  description?: string
  descriptionMarathi?: string
  available24x7: boolean
  tollFree: boolean
  district?: string
  state?: string
}

export interface GeolocationData {
  latitude: number
  longitude: number
  accuracy: number
  altitude?: number
  timestamp: number
  address?: string
  village?: string
  district?: string
  state?: string
}

export interface EmergencyAlert {
  id: string
  userId: string
  patientName: string
  patientPhone: string
  patientAge?: number
  patientGender?: string
  
  type: EmergencyType
  severity: EmergencySeverity
  description?: string
  
  location: GeolocationData
  
  status: AlertStatus
  
  assignedAmbulance?: string
  assignedHospital?: string
  estimatedArrival?: string
  
  emergencyContacts: string[] // Family contacts to notify
  
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface NearbyHospital {
  id: string
  name: string
  type: string
  distance: number // km
  phone: string
  emergencyPhone?: string
  address: string
  availableBeds: number
  hasICU: boolean
  hasBloodBank: boolean
  has24x7Emergency: boolean
  location: {
    latitude: number
    longitude: number
  }
}

export interface AmbulanceService {
  id: string
  name: string
  type: 'GOVERNMENT' | 'PRIVATE' | 'NGO'
  number: string
  vehicleType: 'BASIC' | 'ADVANCED' | 'ICU'
  available: boolean
  estimatedTime?: number // minutes
  location?: {
    latitude: number
    longitude: number
  }
}

// Emergency type configurations
export const emergencyTypes: Array<{
  type: EmergencyType
  label: string
  labelMarathi: string
  icon: string
  severity: EmergencySeverity
  description: string
  descriptionMarathi: string
}> = [
  {
    type: 'CARDIAC',
    label: 'Heart Attack / Chest Pain',
    labelMarathi: 'हृदयविकाराचा झटका / छातीत दुखणे',
    icon: '❤️',
    severity: 'CRITICAL',
    description: 'Severe chest pain, shortness of breath, arm pain',
    descriptionMarathi: 'तीव्र छातीत दुखणे, श्वास घेण्यास त्रास, हातात दुखणे',
  },
  {
    type: 'ACCIDENT',
    label: 'Road Accident',
    labelMarathi: 'रस्ता अपघात',
    icon: '🚗',
    severity: 'CRITICAL',
    description: 'Vehicle collision, injury, bleeding',
    descriptionMarathi: 'वाहन धडक, दुखापत, रक्तस्त्राव',
  },
  {
    type: 'BREATHING',
    label: 'Breathing Difficulty',
    labelMarathi: 'श्वास घेण्यास त्रास',
    icon: '🫁',
    severity: 'CRITICAL',
    description: 'Unable to breathe, choking, asthma attack',
    descriptionMarathi: 'श्वास घेता येत नाही, गुदमरणे, दमा अटॅक',
  },
  {
    type: 'PREGNANCY',
    label: 'Pregnancy Emergency',
    labelMarathi: 'गर्भावस्था आणीबाणी',
    icon: '🤰',
    severity: 'CRITICAL',
    description: 'Labor pain, bleeding, complications',
    descriptionMarathi: 'प्रसूती वेदना, रक्तस्त्राव, गुंतागुंत',
  },
  {
    type: 'SNAKEBITE',
    label: 'Snake Bite',
    labelMarathi: 'सर्पदंश',
    icon: '🐍',
    severity: 'CRITICAL',
    description: 'Bitten by snake, requires antivenin',
    descriptionMarathi: 'सापाने चावले, अँटीव्हेनिम आवश्यक',
  },
  {
    type: 'POISONING',
    label: 'Poisoning',
    labelMarathi: 'विषबाधा',
    icon: '☠️',
    severity: 'CRITICAL',
    description: 'Consumed poison, pesticides, toxic substances',
    descriptionMarathi: 'विष, कीटकनाशक, विषारी पदार्थ खाणे',
  },
  {
    type: 'BURN',
    label: 'Severe Burns',
    labelMarathi: 'तीव्र भाजणे',
    icon: '🔥',
    severity: 'HIGH',
    description: 'Fire burn, acid burn, electrical burn',
    descriptionMarathi: 'आगीने भाजणे, अॅसिड, विजेने भाजणे',
  },
  {
    type: 'DROWNING',
    label: 'Drowning',
    labelMarathi: 'बुडणे',
    icon: '🌊',
    severity: 'CRITICAL',
    description: 'Near drowning, water rescue needed',
    descriptionMarathi: 'बुडत आहे, पाण्यातून बचाव आवश्यक',
  },
  {
    type: 'MEDICAL',
    label: 'Medical Emergency',
    labelMarathi: 'वैद्यकीय आणीबाणी',
    icon: '🏥',
    severity: 'HIGH',
    description: 'Unconscious, seizures, severe pain',
    descriptionMarathi: 'बेशुद्ध, झटके, तीव्र वेदना',
  },
  {
    type: 'OTHER',
    label: 'Other Emergency',
    labelMarathi: 'इतर आणीबाणी',
    icon: '🆘',
    severity: 'MEDIUM',
    description: 'Any other medical emergency',
    descriptionMarathi: 'इतर कोणतीही वैद्यकीय आणीबाणी',
  },
]

// National & State Emergency Contacts
export const emergencyContacts: EmergencyContact[] = [
  // National Emergency Numbers
  {
    id: 'nat-1',
    name: 'National Emergency',
    nameMarathi: 'राष्ट्रीय आणीबाणी',
    number: '112',
    type: 'AMBULANCE',
    description: 'Single emergency number for Police, Fire, Ambulance',
    descriptionMarathi: 'पोलीस, अग्निशमन, रुग्णवाहिका साठी एकच क्रमांक',
    available24x7: true,
    tollFree: true,
  },
  {
    id: 'nat-2',
    name: 'Ambulance (108)',
    nameMarathi: 'रुग्णवाहिका (१०८)',
    number: '108',
    type: 'AMBULANCE',
    description: 'Free government ambulance service',
    descriptionMarathi: 'मोफत सरकारी रुग्णवाहिका सेवा',
    available24x7: true,
    tollFree: true,
  },
  {
    id: 'nat-3',
    name: 'Health Helpline',
    nameMarathi: 'आरोग्य हेल्पलाइन',
    number: '104',
    type: 'HOSPITAL',
    description: 'Health advice, nearest hospital info',
    descriptionMarathi: 'आरोग्य सल्ला, जवळचे रुग्णालय माहिती',
    available24x7: true,
    tollFree: true,
  },
  {
    id: 'nat-4',
    name: 'Police',
    nameMarathi: 'पोलीस',
    number: '100',
    type: 'POLICE',
    description: 'Police emergency',
    descriptionMarathi: 'पोलीस आणीबाणी',
    available24x7: true,
    tollFree: true,
  },
  {
    id: 'nat-5',
    name: 'Fire Brigade',
    nameMarathi: 'अग्निशमन दल',
    number: '101',
    type: 'FIRE',
    description: 'Fire emergency',
    descriptionMarathi: 'आग आणीबाणी',
    available24x7: true,
    tollFree: true,
  },
  {
    id: 'nat-6',
    name: 'Women Helpline',
    nameMarathi: 'महिला हेल्पलाइन',
    number: '181',
    type: 'WOMEN_HELPLINE',
    description: 'Women in distress helpline',
    descriptionMarathi: 'संकटातील महिलांसाठी हेल्पलाइन',
    available24x7: true,
    tollFree: true,
  },
  {
    id: 'nat-7',
    name: 'Child Helpline',
    nameMarathi: 'चाइल्डलाइन',
    number: '1098',
    type: 'CHILD_HELPLINE',
    description: 'Children in need of care and protection',
    descriptionMarathi: 'काळजी आणि संरक्षण आवश्यक असलेली मुले',
    available24x7: true,
    tollFree: true,
  },
  {
    id: 'nat-8',
    name: 'Disaster Management',
    nameMarathi: 'आपत्ती व्यवस्थापन',
    number: '1078',
    type: 'DISASTER',
    description: 'Flood, earthquake, natural disaster',
    descriptionMarathi: 'पूर, भूकंप, नैसर्गिक आपत्ती',
    available24x7: true,
    tollFree: true,
  },
  {
    id: 'nat-9',
    name: 'Poison Information',
    nameMarathi: 'विष माहिती केंद्र',
    number: '1800-116-117',
    type: 'POISON_CONTROL',
    description: 'AIIMS Poison Information Centre',
    descriptionMarathi: 'एम्स विष माहिती केंद्र',
    available24x7: true,
    tollFree: true,
  },
  // Maharashtra Specific
  {
    id: 'mh-1',
    name: 'Maharashtra State Blood Bank',
    nameMarathi: 'महाराष्ट्र राज्य रक्तपेढी',
    number: '104',
    type: 'BLOOD_BANK',
    description: 'Blood availability and donation info',
    descriptionMarathi: 'रक्त उपलब्धता आणि दान माहिती',
    available24x7: true,
    tollFree: true,
    state: 'Maharashtra',
  },
  {
    id: 'mh-2',
    name: 'Mahatma Phule Jan Arogya Yojana',
    nameMarathi: 'महात्मा फुले जन आरोग्य योजना',
    number: '155388',
    type: 'HOSPITAL',
    description: 'Free healthcare scheme helpline',
    descriptionMarathi: 'मोफत आरोग्य योजना हेल्पलाइन',
    available24x7: true,
    tollFree: true,
    state: 'Maharashtra',
  },
]

// Mock nearby hospitals (will be replaced with API)
const mockNearbyHospitals: NearbyHospital[] = [
  {
    id: 'hosp-1',
    name: 'District Hospital Satara',
    type: 'DISTRICT_HOSPITAL',
    distance: 2.5,
    phone: '02162-234000',
    emergencyPhone: '02162-234001',
    address: 'Civil Lines, Satara, Maharashtra 415001',
    availableBeds: 45,
    hasICU: true,
    hasBloodBank: true,
    has24x7Emergency: true,
    location: { latitude: 17.6805, longitude: 74.0183 },
  },
  {
    id: 'hosp-2',
    name: 'PHC Phaltan',
    type: 'PHC',
    distance: 8.2,
    phone: '02166-222333',
    address: 'PHC Complex, Phaltan, Maharashtra 415523',
    availableBeds: 10,
    hasICU: false,
    hasBloodBank: false,
    has24x7Emergency: true,
    location: { latitude: 17.9894, longitude: 74.4352 },
  },
  {
    id: 'hosp-3',
    name: 'Rural Hospital Koregaon',
    type: 'RURAL_HOSPITAL',
    distance: 12.5,
    phone: '02163-245678',
    emergencyPhone: '02163-245679',
    address: 'Main Road, Koregaon, Maharashtra 415501',
    availableBeds: 25,
    hasICU: true,
    hasBloodBank: false,
    has24x7Emergency: true,
    location: { latitude: 17.6927, longitude: 74.1563 },
  },
  {
    id: 'hosp-4',
    name: 'Krishna Hospital (Private)',
    type: 'PRIVATE_HOSPITAL',
    distance: 3.1,
    phone: '02162-256789',
    emergencyPhone: '02162-256790',
    address: 'Main Road, Satara, Maharashtra 415001',
    availableBeds: 60,
    hasICU: true,
    hasBloodBank: true,
    has24x7Emergency: true,
    location: { latitude: 17.6820, longitude: 74.0195 },
  },
]

// Mock ambulance services
const mockAmbulances: AmbulanceService[] = [
  {
    id: 'amb-1',
    name: '108 Maharashtra Emergency',
    type: 'GOVERNMENT',
    number: '108',
    vehicleType: 'ADVANCED',
    available: true,
    estimatedTime: 15,
  },
  {
    id: 'amb-2',
    name: 'District Hospital Ambulance',
    type: 'GOVERNMENT',
    number: '02162-234001',
    vehicleType: 'ICU',
    available: true,
    estimatedTime: 20,
  },
  {
    id: 'amb-3',
    name: 'Red Cross Ambulance',
    type: 'NGO',
    number: '02162-267890',
    vehicleType: 'BASIC',
    available: true,
    estimatedTime: 25,
  },
]

class EmergencyService {
  private currentLocation: GeolocationData | null = null

  /**
   * Get current geolocation
   */
  async getCurrentLocation(): Promise<GeolocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: GeolocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            timestamp: position.timestamp,
          }

          // Try to get address using reverse geocoding (mock for now)
          location.address = await this.reverseGeocode(location.latitude, location.longitude)
          
          this.currentLocation = location
          resolve(location)
        },
        (error) => {
          console.error('Geolocation error:', error)
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      )
    })
  }

  /**
   * Reverse geocode coordinates to address (mock implementation)
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    // In production, use Google Maps or OpenStreetMap Nominatim API
    // For now, return mock address based on approximate location
    if (lat > 17.5 && lat < 18.5 && lng > 73.5 && lng < 75) {
      return 'Satara District, Maharashtra'
    }
    return 'Maharashtra, India'
  }

  /**
   * Create and dispatch emergency SOS alert
   */
  async createSOSAlert(
    type: EmergencyType,
    userId: string,
    patientInfo: {
      name: string
      phone: string
      age?: number
      gender?: string
    },
    description?: string,
    emergencyContacts?: string[]
  ): Promise<EmergencyAlert> {
    // Get current location
    let location: GeolocationData
    try {
      location = await this.getCurrentLocation()
    } catch (error) {
      // Use last known location or default
      location = this.currentLocation || {
        latitude: 17.6805,
        longitude: 74.0183,
        accuracy: 1000,
        timestamp: Date.now(),
        address: 'Location unavailable',
      }
    }

    const emergencyType = emergencyTypes.find(e => e.type === type)
    
    const alert: EmergencyAlert = {
      id: `sos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      patientName: patientInfo.name,
      patientPhone: patientInfo.phone,
      patientAge: patientInfo.age,
      patientGender: patientInfo.gender,
      type,
      severity: emergencyType?.severity || 'HIGH',
      description,
      location,
      status: 'PENDING',
      emergencyContacts: emergencyContacts || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In production, send to backend
    try {
      // const response = await api.post('/emergency/sos', alert)
      // return response.data.data

      // Simulate dispatch
      setTimeout(() => {
        alert.status = 'DISPATCHED'
        alert.assignedAmbulance = '108 Maharashtra Emergency'
        alert.estimatedArrival = '15 minutes'
      }, 2000)

      return alert
    } catch (error) {
      console.error('Error creating SOS alert:', error)
      throw error
    }
  }

  /**
   * Get emergency contacts
   */
  getEmergencyContacts(state?: string, district?: string): EmergencyContact[] {
    let contacts = [...emergencyContacts]
    
    if (state) {
      contacts = contacts.filter(c => !c.state || c.state === state)
    }
    
    if (district) {
      contacts = contacts.filter(c => !c.district || c.district === district)
    }
    
    return contacts
  }

  /**
   * Get nearby hospitals
   */
  async getNearbyHospitals(
    latitude?: number,
    longitude?: number,
    radiusKm: number = 20
  ): Promise<NearbyHospital[]> {
    // In production, call API with location
    // For now, return mock data sorted by distance
    return mockNearbyHospitals.sort((a, b) => a.distance - b.distance)
  }

  /**
   * Get available ambulances
   */
  async getAvailableAmbulances(
    latitude?: number,
    longitude?: number
  ): Promise<AmbulanceService[]> {
    // In production, call API with location
    return mockAmbulances.filter(a => a.available)
  }

  /**
   * Get alert status
   */
  async getAlertStatus(alertId: string): Promise<EmergencyAlert | null> {
    try {
      // const response = await api.get(`/emergency/alerts/${alertId}`)
      // return response.data.data
      return null // Mock for now
    } catch (error) {
      console.error('Error fetching alert status:', error)
      return null
    }
  }

  /**
   * Cancel SOS alert
   */
  async cancelAlert(alertId: string): Promise<boolean> {
    try {
      // await api.put(`/emergency/alerts/${alertId}/cancel`)
      return true
    } catch (error) {
      console.error('Error cancelling alert:', error)
      return false
    }
  }

  /**
   * Notify emergency contacts (family)
   */
  async notifyEmergencyContacts(
    alertId: string,
    contacts: string[],
    message: string
  ): Promise<boolean> {
    try {
      // In production, send SMS/notifications via backend
      // await api.post('/emergency/notify', { alertId, contacts, message })
      console.log('Notifying contacts:', contacts, 'Message:', message)
      return true
    } catch (error) {
      console.error('Error notifying contacts:', error)
      return false
    }
  }

  /**
   * Get directions to nearest hospital
   */
  getDirectionsUrl(hospital: NearbyHospital): string {
    const origin = this.currentLocation
      ? `${this.currentLocation.latitude},${this.currentLocation.longitude}`
      : ''
    const destination = `${hospital.location.latitude},${hospital.location.longitude}`
    
    return `https://www.google.com/maps/dir/${origin}/${destination}`
  }

  /**
   * Call emergency number
   */
  callEmergencyNumber(number: string): void {
    window.location.href = `tel:${number}`
  }
}

export const emergencyService = new EmergencyService()
export default emergencyService
