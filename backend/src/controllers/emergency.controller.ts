import { Request, Response } from 'express'
import { prisma } from '../config/database'
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendServerError,
} from '../utils/response.utils'
import { AuthRequest } from '../types'

// Emergency contact types
interface EmergencyContact {
  id: string
  name: string
  nameMarathi?: string
  number: string
  type: string
  description?: string
  descriptionMarathi?: string
  available24x7: boolean
  tollFree: boolean
  state?: string
}

// Mock data - In production, these would come from database
const emergencyContacts: EmergencyContact[] = [
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
    description: 'Health advice and hospital information',
    descriptionMarathi: 'आरोग्य सल्ला आणि रुग्णालय माहिती',
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
    description: 'Children in need',
    descriptionMarathi: 'मुलांसाठी मदत',
    available24x7: true,
    tollFree: true,
  },
  {
    id: 'nat-8',
    name: 'Poison Information',
    nameMarathi: 'विष माहिती केंद्र',
    number: '1800-116-117',
    type: 'POISON_CONTROL',
    description: 'AIIMS Poison Information Centre',
    descriptionMarathi: 'एम्स विष माहिती केंद्र',
    available24x7: true,
    tollFree: true,
  },
]

const healthAlerts = [
  {
    id: 'alert-1',
    title: 'Dengue Prevention Advisory',
    titleMarathi: 'डेंग्यू प्रतिबंध सल्ला',
    message: 'With the onset of monsoon, dengue cases are rising. Remove stagnant water around homes.',
    messageMarathi: 'पावसाळा सुरू झाल्याने डेंग्यूचे रुग्ण वाढत आहेत. घराभोवती साचलेले पाणी काढा.',
    severity: 'ALERT',
    category: 'PREVENTION',
    affectedAreas: ['Satara', 'Pune', 'Kolhapur'],
    issueDate: '2026-09-01',
    source: 'Maharashtra Public Health Department',
    isActive: true,
  },
  {
    id: 'alert-2',
    title: 'Free Vaccination Camp',
    titleMarathi: 'मोफत लसीकरण शिबीर',
    message: 'Free COVID-19 booster doses available at all PHCs.',
    messageMarathi: 'सर्व PHC मध्ये मोफत कोविड-१९ बूस्टर डोस उपलब्ध.',
    severity: 'INFO',
    category: 'VACCINATION',
    affectedAreas: ['All Maharashtra'],
    issueDate: '2026-09-01',
    source: 'National Health Mission',
    isActive: true,
  },
]

/**
 * Emergency Controller
 * Handles SOS alerts, emergency contacts, health alerts
 */
export class EmergencyController {
  /**
   * Get emergency contacts
   * GET /api/emergency/contacts
   */
  async getEmergencyContacts(req: Request, res: Response): Promise<Response> {
    try {
      const { state, type } = req.query

      let contacts = [...emergencyContacts]

      if (state) {
        contacts = contacts.filter(c => !c.state || c.state === state)
      }

      if (type) {
        contacts = contacts.filter(c => c.type === type)
      }

      return sendSuccess(res, contacts)
    } catch (error) {
      console.error('Error fetching emergency contacts:', error)
      return sendServerError(res, 'Failed to fetch emergency contacts')
    }
  }

  /**
   * Get nearby hospitals
   * GET /api/emergency/hospitals/nearby
   */
  async getNearbyHospitals(req: Request, res: Response): Promise<Response> {
    try {
      const { latitude, longitude, radius } = req.query

      // In production, use PostGIS or similar for geo queries
      const facilities = await prisma.facility.findMany({
        where: {
          isActive: true,
          OR: [
            { type: 'DISTRICT_HOSPITAL' },
            { type: 'GOVERNMENT_HOSPITAL' },
            { type: 'PHC' },
            { type: 'CHC' },
            { type: 'RURAL_HOSPITAL' },
          ],
        },
        take: 10,
        orderBy: { name: 'asc' },
      })

      const formattedFacilities = facilities.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        phone: f.phone,
        emergencyPhone: f.emergencyPhone,
        address: `${f.street}, ${f.city}, ${f.district}`,
        availableBeds: f.availableBeds,
        hasICU: f.totalBeds > 20,
        hasBloodBank: f.services.includes('Blood Bank'),
        has24x7Emergency: f.is24x7,
        location: {
          latitude: f.latitude,
          longitude: f.longitude,
        },
        distance: 5, // Mock distance - calculate in production
      }))

      return sendSuccess(res, formattedFacilities)
    } catch (error) {
      console.error('Error fetching nearby hospitals:', error)
      return sendServerError(res, 'Failed to fetch nearby hospitals')
    }
  }

  /**
   * Get available ambulances
   * GET /api/emergency/ambulances/available
   */
  async getAvailableAmbulances(req: Request, res: Response): Promise<Response> {
    try {
      // Mock ambulance data - In production, integrate with 108 API
      const ambulances = [
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
          name: 'Red Cross Ambulance',
          type: 'NGO',
          number: '02162-267890',
          vehicleType: 'BASIC',
          available: true,
          estimatedTime: 20,
        },
      ]

      return sendSuccess(res, ambulances)
    } catch (error) {
      console.error('Error fetching ambulances:', error)
      return sendServerError(res, 'Failed to fetch ambulances')
    }
  }

  /**
   * Create SOS Alert
   * POST /api/emergency/sos
   */
  async createSOSAlert(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId
      const {
        type,
        patientName,
        patientPhone,
        patientAge,
        patientGender,
        description,
        location,
        emergencyContacts,
      } = req.body

      // In production:
      // 1. Save SOS alert to database
      // 2. Dispatch to nearest ambulance/hospital
      // 3. Send SMS to emergency contacts
      // 4. Create notification

      const alert = {
        id: `sos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        patientName,
        patientPhone,
        patientAge,
        patientGender,
        type,
        severity: 'CRITICAL',
        description,
        location,
        status: 'PENDING',
        emergencyContacts: emergencyContacts || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Simulate dispatch
      setTimeout(() => {
        // In production, update status in database
        console.log('SOS Alert dispatched:', alert.id)
      }, 2000)

      return sendCreated(res, {
        ...alert,
        status: 'DISPATCHED',
        assignedAmbulance: '108 Maharashtra Emergency',
        estimatedArrival: '15 minutes',
      }, 'SOS Alert created and dispatched')
    } catch (error) {
      console.error('Error creating SOS alert:', error)
      return sendServerError(res, 'Failed to create SOS alert')
    }
  }

  /**
   * Get SOS Alert Status
   * GET /api/emergency/sos/:id
   */
  async getSOSAlertStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // In production, fetch from database
      const alert = {
        id,
        status: 'EN_ROUTE',
        assignedAmbulance: '108 Maharashtra Emergency',
        estimatedArrival: '10 minutes',
        updatedAt: new Date().toISOString(),
      }

      return sendSuccess(res, alert)
    } catch (error) {
      console.error('Error fetching SOS status:', error)
      return sendServerError(res, 'Failed to fetch SOS status')
    }
  }

  /**
   * Cancel SOS Alert
   * PUT /api/emergency/sos/:id/cancel
   */
  async cancelSOSAlert(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const userId = req.user?.userId

      // In production:
      // 1. Verify user owns this alert
      // 2. Update status to CANCELLED
      // 3. Notify assigned ambulance

      return sendSuccess(res, { id, status: 'CANCELLED' }, 'SOS Alert cancelled')
    } catch (error) {
      console.error('Error cancelling SOS alert:', error)
      return sendServerError(res, 'Failed to cancel SOS alert')
    }
  }

  /**
   * Notify Emergency Contacts
   * POST /api/emergency/notify
   */
  async notifyEmergencyContacts(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { alertId, contacts, message } = req.body

      // In production:
      // 1. Send SMS to each contact
      // 2. Log notification in database

      console.log(`Notifying ${contacts.length} contacts for alert ${alertId}`)

      return sendSuccess(res, { notified: contacts.length }, 'Emergency contacts notified')
    } catch (error) {
      console.error('Error notifying contacts:', error)
      return sendServerError(res, 'Failed to notify contacts')
    }
  }

  /**
   * Get Health Alerts
   * GET /api/emergency/alerts
   */
  async getHealthAlerts(req: Request, res: Response): Promise<Response> {
    try {
      const { district, severity, category } = req.query

      let alerts = [...healthAlerts].filter(a => a.isActive)

      if (district) {
        alerts = alerts.filter(a =>
          a.affectedAreas.includes(district as string) ||
          a.affectedAreas.includes('All Maharashtra')
        )
      }

      if (severity) {
        alerts = alerts.filter(a => a.severity === severity)
      }

      if (category) {
        alerts = alerts.filter(a => a.category === category)
      }

      return sendSuccess(res, alerts)
    } catch (error) {
      console.error('Error fetching health alerts:', error)
      return sendServerError(res, 'Failed to fetch health alerts')
    }
  }

  /**
   * Get Health Alert by ID
   * GET /api/emergency/alerts/:id
   */
  async getHealthAlertById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const alert = healthAlerts.find(a => a.id === id)

      if (!alert) {
        return sendNotFound(res, 'Health alert not found')
      }

      return sendSuccess(res, alert)
    } catch (error) {
      console.error('Error fetching health alert:', error)
      return sendServerError(res, 'Failed to fetch health alert')
    }
  }

  /**
   * Get Disease Outbreaks
   * GET /api/emergency/outbreaks
   */
  async getDiseaseOutbreaks(req: Request, res: Response): Promise<Response> {
    try {
      const { district } = req.query

      // Mock outbreak data
      const outbreaks = [
        {
          id: 'outbreak-1',
          diseaseName: 'Dengue Fever',
          diseaseNameMarathi: 'डेंग्यू ताप',
          affectedDistricts: ['Pune', 'Satara', 'Kolhapur'],
          confirmedCases: 1245,
          activeCases: 355,
          recoveredCases: 890,
          severity: 'ALERT',
          lastUpdated: new Date().toISOString(),
        },
      ]

      let filtered = outbreaks
      if (district) {
        filtered = outbreaks.filter(o => o.affectedDistricts.includes(district as string))
      }

      return sendSuccess(res, filtered)
    } catch (error) {
      console.error('Error fetching outbreaks:', error)
      return sendServerError(res, 'Failed to fetch outbreaks')
    }
  }

  /**
   * Get Health Camps
   * GET /api/emergency/camps
   */
  async getHealthCamps(req: Request, res: Response): Promise<Response> {
    try {
      const { district, type } = req.query

      // Mock camp data
      const camps = [
        {
          id: 'camp-1',
          name: 'Free Eye Checkup Camp',
          nameMarathi: 'मोफत नेत्र तपासणी शिबीर',
          type: 'EYE_CHECKUP',
          date: '2026-09-15',
          time: '9:00 AM - 4:00 PM',
          venue: 'Zilla Parishad Hall, Satara',
          isFree: true,
          contactNumber: '02162-234567',
        },
        {
          id: 'camp-2',
          name: 'Blood Donation Camp',
          nameMarathi: 'रक्तदान शिबीर',
          type: 'BLOOD_DONATION',
          date: '2026-09-10',
          time: '10:00 AM - 5:00 PM',
          venue: 'District Hospital, Satara',
          isFree: true,
          contactNumber: '02162-234000',
        },
      ]

      let filtered = camps
      if (type) {
        filtered = camps.filter(c => c.type === type)
      }

      // Filter future camps only
      const today = new Date().toISOString().split('T')[0]
      filtered = filtered.filter(c => c.date >= today)

      return sendSuccess(res, filtered)
    } catch (error) {
      console.error('Error fetching health camps:', error)
      return sendServerError(res, 'Failed to fetch health camps')
    }
  }

  /**
   * Subscribe to Health Alerts
   * POST /api/emergency/subscribe
   */
  async subscribeToAlerts(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { district, phone } = req.body
      const userId = req.user?.userId

      // In production:
      // 1. Save subscription to database
      // 2. Integrate with SMS service

      return sendSuccess(res, { subscribed: true, district }, 'Subscribed to health alerts')
    } catch (error) {
      console.error('Error subscribing to alerts:', error)
      return sendServerError(res, 'Failed to subscribe to alerts')
    }
  }
}

export default new EmergencyController()
