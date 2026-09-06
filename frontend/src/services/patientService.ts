import api from './api'
import type { Patient, ApiResponse } from '../types'

export const DEMO_PATIENT: Patient = {
  id: 'pat-001',
  _id: 'pat-001',
  userId: 'u-pat-1',
  dateOfBirth: '1992-05-14',
  gender: 'F',
  bloodGroup: 'B+',
  riskLevel: 'LOW',
  address: {
    street: 'Station Road, Near Gram Panchayat',
    village: 'Khed',
    taluka: 'Shirur',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '410501',
  },
  emergencyContact: {
    name: 'Sanjay Sharma',
    phone: '9822012345',
    relation: 'Spouse',
  },
  medicalHistory: ['Mild Seasonal Allergies'],
  allergies: ['Penicillin', 'Dust mites'],
  currentMedications: ['Cetirizine 10mg (as needed)'],
  createdAt: '2023-01-01',
  updatedAt: '2024-01-01',
  user: {
    id: 'u-pat-1',
    _id: 'u-pat-1',
    firstName: 'Priya',
    lastName: 'Sharma',
    name: 'Priya Sharma',
    email: 'patient@demo.com',
    phone: '9876543210',
    role: 'PATIENT',
    preferredLanguage: 'en',
    isActive: true,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
  },
}

function getLocalPatient(): Patient {
  try {
    const raw = localStorage.getItem('swasthyasetu_patient_profile')
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error(e)
  }
  localStorage.setItem('swasthyasetu_patient_profile', JSON.stringify(DEMO_PATIENT))
  return DEMO_PATIENT
}

function saveLocalPatient(pat: Patient) {
  try {
    localStorage.setItem('swasthyasetu_patient_profile', JSON.stringify(pat))
  } catch (e) {
    console.error(e)
  }
}

export const patientService = {
  // Get current patient profile
  async getMyProfile(): Promise<Patient> {
    try {
      const res = await api.get<ApiResponse<Patient>>('/patients/me')
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getMyProfile fallback to local', err)
    }
    return getLocalPatient()
  },

  // Update current patient profile
  async updateProfile(updates: Partial<Patient>): Promise<Patient> {
    try {
      const current = getLocalPatient()
      const res = await api.put<ApiResponse<Patient>>(`/patients/${current.id || current._id}`, updates)
      if (res.data?.data) {
        saveLocalPatient(res.data.data)
        return res.data.data
      }
    } catch (err) {
      console.warn('API updateProfile fallback to local', err)
    }

    const current = getLocalPatient()
    const merged = { ...current, ...updates, updatedAt: new Date().toISOString() }
    saveLocalPatient(merged)
    return merged
  },

  // Get patient by ID (for doctors and health workers)
  async getPatientById(id: string): Promise<Patient | undefined> {
    try {
      const res = await api.get<ApiResponse<Patient>>(`/patients/${id}`)
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getPatientById fallback to local', err)
    }
    const current = getLocalPatient()
    if (current.id === id || current._id === id) return current
    return {
      ...current,
      id,
      _id: id,
      user: {
        ...(current.user as any),
        firstName: 'Ramesh',
        lastName: 'Jadhav',
        name: 'Ramesh Jadhav',
      },
      riskLevel: 'HIGH',
    }
  },

  // List all patients (for doctor patient roster)
  async listPatients(params?: { riskLevel?: string; search?: string }): Promise<Patient[]> {
    try {
      const res = await api.get<ApiResponse<Patient[]>>('/patients', { params })
      if (res.data?.data && res.data.data.length > 0) return res.data.data
    } catch (err) {
      console.warn('API listPatients fallback to local', err)
    }

    const demoList: Patient[] = [
      getLocalPatient(),
      {
        id: 'pat-002',
        _id: 'pat-002',
        userId: 'u-pat-2',
        dateOfBirth: '1970-03-12',
        gender: 'M',
        bloodGroup: 'O+',
        riskLevel: 'HIGH',
        address: {
          village: 'Velhe',
          taluka: 'Velhe',
          district: 'Pune',
          state: 'Maharashtra',
          pincode: '412212',
        },
        emergencyContact: {
          name: 'Sunita Jadhav',
          phone: '9822998877',
          relation: 'Wife',
        },
        medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
        allergies: ['Sulfa'],
        currentMedications: ['Amlodipine 5mg', 'Metformin 500mg'],
        createdAt: '2023-04-10',
        updatedAt: '2024-02-15',
        user: {
          id: 'u-pat-2',
          _id: 'u-pat-2',
          firstName: 'Ramesh',
          lastName: 'Jadhav',
          name: 'Ramesh Jadhav',
          email: 'ramesh.jadhav@example.com',
          phone: '9890123456',
          role: 'PATIENT',
          preferredLanguage: 'mr',
          isActive: true,
          createdAt: '2023-04-10',
          updatedAt: '2024-02-15',
        },
      },
      {
        id: 'pat-003',
        _id: 'pat-003',
        userId: 'u-pat-3',
        dateOfBirth: '1988-11-25',
        gender: 'F',
        bloodGroup: 'A+',
        riskLevel: 'MODERATE',
        address: {
          village: 'Bhor',
          taluka: 'Bhor',
          district: 'Pune',
          state: 'Maharashtra',
          pincode: '412206',
        },
        emergencyContact: {
          name: 'Mahesh More',
          phone: '9822114477',
          relation: 'Brother',
        },
        medicalHistory: ['Chronic Bronchial Asthma'],
        allergies: ['Dust', 'Pollen'],
        currentMedications: ['Salbutamol Inhaler'],
        createdAt: '2023-06-18',
        updatedAt: '2024-03-01',
        user: {
          id: 'u-pat-3',
          _id: 'u-pat-3',
          firstName: 'Anjali',
          lastName: 'More',
          name: 'Anjali More',
          email: 'anjali.more@example.com',
          phone: '9823998811',
          role: 'PATIENT',
          preferredLanguage: 'mr',
          isActive: true,
          createdAt: '2023-06-18',
          updatedAt: '2024-03-01',
        },
      },
      {
        id: 'pat-004',
        _id: 'pat-004',
        userId: 'u-pat-4',
        dateOfBirth: '2001-09-05',
        gender: 'M',
        bloodGroup: 'AB+',
        riskLevel: 'LOW',
        address: {
          village: 'Junnar',
          taluka: 'Junnar',
          district: 'Pune',
          state: 'Maharashtra',
          pincode: '410502',
        },
        emergencyContact: {
          name: 'Shankar Patil',
          phone: '9822663322',
          relation: 'Father',
        },
        medicalHistory: [],
        allergies: [],
        currentMedications: [],
        createdAt: '2023-08-20',
        updatedAt: '2024-01-10',
        user: {
          id: 'u-pat-4',
          _id: 'u-pat-4',
          firstName: 'Ganesh',
          lastName: 'Patil',
          name: 'Ganesh Patil',
          email: 'ganesh.patil@example.com',
          phone: '9850123490',
          role: 'PATIENT',
          preferredLanguage: 'mr',
          isActive: true,
          createdAt: '2023-08-20',
          updatedAt: '2024-01-10',
        },
      },
    ]

    let resList = demoList
    if (params?.riskLevel && params.riskLevel !== 'ALL') {
      resList = resList.filter(p => p.riskLevel === params.riskLevel)
    }
    if (params?.search) {
      const q = params.search.toLowerCase()
      resList = resList.filter(p =>
        (p.user as any)?.firstName?.toLowerCase().includes(q) ||
        (p.user as any)?.lastName?.toLowerCase().includes(q) ||
        p.address?.village?.toLowerCase().includes(q) ||
        p.address?.district?.toLowerCase().includes(q)
      )
    }
    return resList
  },
}
