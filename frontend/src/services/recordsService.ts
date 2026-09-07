import api from './api'
import type { Prescription, MedicineReminder, MedicalRecord, ApiResponse } from '../types'

export interface EHRTimelineItem {
  id: string
  date: string
  type: 'CONSULTATION' | 'PRESCRIPTION' | 'LAB_REPORT' | 'AI_ASSESSMENT' | 'VITALS_CHECK'
  title: string
  subtitle: string
  details?: string
  doctorName?: string
  vitalHighlights?: Record<string, string | number>
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive'
}

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-001',
    _id: 'rx-001',
    patientId: 'pat-001',
    doctorId: 'doc-001',
    appointmentId: 'apt-101',
    diagnosis: 'Acute Upper Respiratory Infection & Mild Bronchospasm',
    medications: [
      {
        name: 'Amoxicillin + Clavulanic Acid 625mg',
        dosage: '1 tablet',
        frequency: 'Twice daily (Morning & Night)',
        duration: '5 days',
        instructions: 'Take strictly after meals with water',
      },
      {
        name: 'Paracetamol 650mg',
        dosage: '1 tablet',
        frequency: 'As needed (max 3 times/day)',
        duration: '3 days',
        instructions: 'Take if temperature exceeds 100°F',
      },
      {
        name: 'Levocetirizine 5mg',
        dosage: '1 tablet',
        frequency: 'Once daily at bedtime',
        duration: '5 days',
        instructions: 'May cause mild drowsiness',
      },
      {
        name: 'Steam Inhalation',
        dosage: '10 minutes',
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'Inhale warm moist steam morning and evening',
      },
    ],
    notes: 'Rest adequately, avoid cold beverages, and drink warm water. Review after 5 days if fever persists.',
    followUpDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'rx-002',
    _id: 'rx-002',
    patientId: 'pat-001',
    doctorId: 'doc-001',
    appointmentId: 'apt-099',
    diagnosis: 'Mild Hypertension & Electrolyte Optimization',
    medications: [
      {
        name: 'Telmisartan 40mg',
        dosage: '1 tablet',
        frequency: 'Once daily (Morning)',
        duration: '30 days',
        instructions: 'Take regularly after breakfast',
      },
      {
        name: 'B-Complex with Vitamin C',
        dosage: '1 capsule',
        frequency: 'Once daily (Afternoon)',
        duration: '15 days',
        instructions: 'Take after lunch',
      },
    ],
    notes: 'Reduce dietary salt. Maintain daily blood pressure log.',
    followUpDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
]

export const INITIAL_REMINDERS: MedicineReminder[] = [
  {
    id: 'rem-1',
    _id: 'rem-1',
    patientId: 'pat-001',
    medicineName: 'Amoxicillin 625mg',
    dosage: '1 tablet',
    frequency: 'TWICE_DAILY',
    timeSlots: ['08:30 AM', '08:30 PM'],
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    instructions: 'After breakfast and dinner',
    isActive: true,
    history: [{ date: new Date().toISOString().split('T')[0], taken: true, takenAt: '08:45 AM' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rem-2',
    _id: 'rem-2',
    patientId: 'pat-001',
    medicineName: 'Telmisartan 40mg',
    dosage: '1 tablet',
    frequency: 'ONCE_DAILY',
    timeSlots: ['09:00 AM'],
    startDate: new Date().toISOString(),
    instructions: 'Daily morning after breakfast',
    isActive: true,
    history: [{ date: new Date().toISOString().split('T')[0], taken: false }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rem-3',
    _id: 'rem-3',
    patientId: 'pat-001',
    medicineName: 'Levocetirizine 5mg',
    dosage: '1 tablet',
    frequency: 'ONCE_DAILY',
    timeSlots: ['09:30 PM'],
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    instructions: 'At bedtime',
    isActive: true,
    history: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

function getLocalPrescriptions(): Prescription[] {
  try {
    const raw = localStorage.getItem('swasthyasetu_prescriptions')
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error(e)
  }
  localStorage.setItem('swasthyasetu_prescriptions', JSON.stringify(INITIAL_PRESCRIPTIONS))
  return INITIAL_PRESCRIPTIONS
}

function saveLocalPrescriptions(rx: Prescription[]) {
  try {
    localStorage.setItem('swasthyasetu_prescriptions', JSON.stringify(rx))
  } catch (e) {
    console.error(e)
  }
}

function getLocalReminders(): MedicineReminder[] {
  try {
    const raw = localStorage.getItem('swasthyasetu_reminders')
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error(e)
  }
  localStorage.setItem('swasthyasetu_reminders', JSON.stringify(INITIAL_REMINDERS))
  return INITIAL_REMINDERS
}

function saveLocalReminders(rem: MedicineReminder[]) {
  try {
    localStorage.setItem('swasthyasetu_reminders', JSON.stringify(rem))
  } catch (e) {
    console.error(e)
  }
}

export const recordsService = {
  // Get all prescriptions for patient
  async getPrescriptions(): Promise<Prescription[]> {
    try {
      const res = await api.get<ApiResponse<Prescription[]>>('/patients/me/prescriptions')
      if (res.data?.data && res.data.data.length > 0) return res.data.data
    } catch (err) {
      console.warn('API getPrescriptions fallback to local', err)
    }
    return getLocalPrescriptions()
  },

  // Issue new prescription (doctor)
  async createPrescription(rx: Partial<Prescription>): Promise<Prescription> {
    try {
      const res = await api.post<ApiResponse<Prescription>>('/prescriptions', rx)
      if (res.data?.data) {
        const all = getLocalPrescriptions()
        all.unshift(res.data.data)
        saveLocalPrescriptions(all)
        return res.data.data
      }
    } catch (err) {
      console.warn('API createPrescription fallback to local', err)
    }

    const all = getLocalPrescriptions()
    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      _id: `rx-${Date.now()}`,
      patientId: rx.patientId || 'pat-001',
      doctorId: rx.doctorId || 'doc-001',
      appointmentId: rx.appointmentId || 'apt-101',
      diagnosis: rx.diagnosis || 'Clinical teleconsultation prescription',
      medications: rx.medications || [],
      notes: rx.notes,
      followUpDate: rx.followUpDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    all.unshift(newRx)
    saveLocalPrescriptions(all)

    // Auto-generate reminders for patient dashboard from prescribed medications
    if (newRx.medications && newRx.medications.length > 0) {
      const currentReminders = getLocalReminders()
      newRx.medications.forEach((med, idx) => {
        const reminder: MedicineReminder = {
          id: `rem-${Date.now()}-${idx}`,
          _id: `rem-${Date.now()}-${idx}`,
          patientId: newRx.patientId,
          medicineName: med.name,
          dosage: med.dosage || '1 tablet',
          frequency: med.frequency?.toLowerCase().includes('twice') ? 'TWICE_DAILY' : 'ONCE_DAILY',
          timeSlots: ['09:00 AM', '09:00 PM'],
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          instructions: med.instructions || 'Take strictly as prescribed',
          isActive: true,
          history: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        currentReminders.unshift(reminder)
      })
      saveLocalReminders(currentReminders)
    }

    // Broadcast sync event across tabs & components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('swasthyasetu:records_sync', { detail: newRx }))
      try {
        const channel = new BroadcastChannel('swasthyasetu_records_bus')
        channel.postMessage({ type: 'NEW_PRESCRIPTION', prescription: newRx })
      } catch {}
    }

    return newRx
  },

  // Get medicine reminders
  async getReminders(): Promise<MedicineReminder[]> {
    try {
      const res = await api.get<ApiResponse<MedicineReminder[]>>('/reminders')
      if (res.data?.data && res.data.data.length > 0) return res.data.data
    } catch (err) {
      console.warn('API getReminders fallback to local', err)
    }
    return getLocalReminders()
  },

  // Toggle medicine taken status for today
  async toggleReminderStatus(id: string): Promise<MedicineReminder[]> {
    const list = getLocalReminders()
    const today = new Date().toISOString().split('T')[0]
    const item = list.find(r => r.id === id || r._id === id)
    if (item) {
      const existing = item.history.find(h => h.date === today)
      if (existing) {
        existing.taken = !existing.taken
      } else {
        item.history.push({ date: today, taken: true, takenAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
      }
      saveLocalReminders(list)
    }
    return [...list]
  },

  // Add custom medicine reminder
  async addReminder(rem: Partial<MedicineReminder>): Promise<MedicineReminder> {
    const list = getLocalReminders()
    const newRem: MedicineReminder = {
      id: `rem-${Date.now()}`,
      _id: `rem-${Date.now()}`,
      patientId: 'pat-001',
      medicineName: rem.medicineName || 'Medicine',
      dosage: rem.dosage || '1 tablet',
      frequency: rem.frequency || 'ONCE_DAILY',
      timeSlots: rem.timeSlots || ['09:00 AM'],
      startDate: new Date().toISOString(),
      instructions: rem.instructions,
      isActive: true,
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    list.unshift(newRem)
    saveLocalReminders(list)
    return newRem
  },

  // Get unified Electronic Health Record (EHR) timeline
  async getEHRTimeline(patientId?: string): Promise<EHRTimelineItem[]> {
    const timeline: EHRTimelineItem[] = [
      {
        id: 'ehr-1',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        type: 'CONSULTATION',
        title: 'Teleconsultation Completed',
        subtitle: 'Dr. Rajesh Patil (General Physician)',
        details: 'Evaluated for fever, cough, and body pain. Oxygen saturation 97%, Blood Pressure 124/82 mmHg.',
        doctorName: 'Dr. Rajesh Patil',
        vitalHighlights: { 'SpO₂': '97%', 'BP': '124/82', 'Pulse': '76 bpm' },
        badgeVariant: 'default',
      },
      {
        id: 'ehr-2',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        type: 'PRESCRIPTION',
        title: 'Digital Prescription Issued',
        subtitle: '4 medications prescribed for URTI',
        details: 'Amoxicillin 625mg, Paracetamol 650mg, Levocetirizine 5mg, Steam Inhalation.',
        doctorName: 'Dr. Rajesh Patil',
        badgeVariant: 'secondary',
      },
      {
        id: 'ehr-3',
        date: new Date(Date.now() - 4 * 86400000).toISOString(),
        type: 'AI_ASSESSMENT',
        title: 'AI Health Assessment Performed',
        subtitle: 'Preliminary Risk: MODERATE (Score 52/100)',
        details: 'Triggered by fever and headache. Recommended clinical teleconsultation.',
        badgeVariant: 'destructive',
      },
      {
        id: 'ehr-4',
        date: new Date(Date.now() - 20 * 86400000).toISOString(),
        type: 'LAB_REPORT',
        title: 'Complete Blood Count (CBC) & Dengue NS1',
        subtitle: 'Khed Primary Health Centre (PHC)',
        details: 'Hemoglobin: 12.8 g/dL, Platelets: 240,000 /mcL, Dengue NS1: Negative.',
        badgeVariant: 'outline',
      },
      {
        id: 'ehr-5',
        date: new Date(Date.now() - 30 * 86400000).toISOString(),
        type: 'VITALS_CHECK',
        title: 'ASHA Field Worker Screening',
        subtitle: 'Sunita Jadhav (ASHA Worker, Shirur Taluka)',
        details: 'Routine maternal & general health vitals recorded during village household visit.',
        vitalHighlights: { 'BP': '120/80', 'Glucose': '98 mg/dL' },
        badgeVariant: 'secondary',
      },
    ]
    return timeline
  }
}
