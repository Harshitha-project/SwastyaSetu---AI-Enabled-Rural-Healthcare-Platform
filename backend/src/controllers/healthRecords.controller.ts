import { Request, Response } from 'express'

/**
 * Health Records Controller
 * Handles medical records, lab reports, vaccinations, allergies, and documents
 */

// Types
interface MedicalRecord {
  id: string
  patientId: string
  type: 'consultation' | 'hospitalization' | 'surgery' | 'lab_report' | 'imaging' | 'prescription' | 'vaccination'
  title: string
  titleMr: string
  description: string
  descriptionMr: string
  date: string
  doctorName?: string
  facilityName?: string
  facilityNameMr?: string
  diagnosis?: string
  diagnosisMr?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

interface LabReport {
  id: string
  patientId: string
  testName: string
  testNameMr: string
  category: string
  date: string
  labName: string
  labNameMr: string
  status: 'pending' | 'completed' | 'abnormal'
  results: LabResult[]
  doctorName?: string
  notes?: string
  notesMr?: string
  createdAt: string
}

interface LabResult {
  parameter: string
  parameterMr: string
  value: string
  unit: string
  normalRange: string
  status: 'normal' | 'low' | 'high' | 'critical'
}

interface Vaccination {
  id: string
  patientId: string
  vaccineName: string
  vaccineNameMr: string
  disease: string
  diseaseMr: string
  doseNumber: number
  totalDoses: number
  date: string
  nextDueDate?: string
  batchNumber?: string
  manufacturer?: string
  administeredBy?: string
  facilityName: string
  facilityNameMr: string
  status: 'completed' | 'due' | 'overdue' | 'scheduled'
  certificateUrl?: string
  createdAt: string
}

interface Allergy {
  id: string
  patientId: string
  allergen: string
  allergenMr: string
  type: 'drug' | 'food' | 'environmental' | 'insect' | 'other'
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening'
  reaction: string
  reactionMr: string
  diagnosedDate?: string
  diagnosedBy?: string
  status: 'active' | 'resolved' | 'suspected'
  createdAt: string
}

interface ChronicCondition {
  id: string
  patientId: string
  condition: string
  conditionMr: string
  icdCode?: string
  diagnosedDate: string
  diagnosedBy?: string
  status: 'active' | 'managed' | 'resolved'
  severity: 'mild' | 'moderate' | 'severe'
  medications?: string[]
  notes?: string
  notesMr?: string
  lastReviewDate?: string
  nextReviewDate?: string
  createdAt: string
}

// Mock Data
const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'rec-001',
    patientId: 'pat-001',
    type: 'consultation',
    title: 'General Health Checkup',
    titleMr: 'सामान्य आरोग्य तपासणी',
    description: 'Routine annual health checkup with blood tests and ECG',
    descriptionMr: 'वार्षिक आरोग्य तपासणी रक्त चाचण्या आणि ECG सह',
    date: '2026-08-15',
    doctorName: 'Dr. Rajesh Kulkarni',
    facilityName: 'District Hospital Pune',
    facilityNameMr: 'जिल्हा रुग्णालय पुणे',
    diagnosis: 'Good overall health, mild vitamin D deficiency',
    diagnosisMr: 'एकंदर चांगले आरोग्य, सौम्य व्हिटॅमिन डी कमतरता',
    createdAt: '2026-08-15T10:30:00Z',
    updatedAt: '2026-08-15T10:30:00Z',
  },
  {
    id: 'rec-002',
    patientId: 'pat-001',
    type: 'hospitalization',
    title: 'Dengue Treatment',
    titleMr: 'डेंग्यू उपचार',
    description: 'Admitted for dengue fever with low platelet count',
    descriptionMr: 'कमी प्लेटलेट संख्येसह डेंग्यू तापासाठी दाखल',
    date: '2026-06-20',
    doctorName: 'Dr. Anjali Desai',
    facilityName: 'Sassoon General Hospital',
    facilityNameMr: 'ससून सामान्य रुग्णालय',
    diagnosis: 'Dengue fever (Classical)',
    diagnosisMr: 'डेंग्यू ताप (शास्त्रीय)',
    metadata: {
      admissionDate: '2026-06-20',
      dischargeDate: '2026-06-25',
      wardType: 'General',
      totalDays: 5,
    },
    createdAt: '2026-06-20T14:00:00Z',
    updatedAt: '2026-06-25T11:00:00Z',
  },
]

const mockLabReports: LabReport[] = [
  {
    id: 'lab-001',
    patientId: 'pat-001',
    testName: 'Complete Blood Count (CBC)',
    testNameMr: 'संपूर्ण रक्त गणना (CBC)',
    category: 'blood',
    date: '2026-09-01',
    labName: 'Metropolis Healthcare',
    labNameMr: 'मेट्रोपोलिस हेल्थकेअर',
    status: 'completed',
    doctorName: 'Dr. Rajesh Kulkarni',
    results: [
      { parameter: 'Hemoglobin', parameterMr: 'हिमोग्लोबिन', value: '14.2', unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' },
      { parameter: 'WBC Count', parameterMr: 'WBC गणना', value: '7500', unit: '/μL', normalRange: '4500-11000', status: 'normal' },
      { parameter: 'Platelet Count', parameterMr: 'प्लेटलेट गणना', value: '245000', unit: '/μL', normalRange: '150000-400000', status: 'normal' },
    ],
    notes: 'All parameters within normal limits',
    notesMr: 'सर्व मापदंड सामान्य मर्यादेत',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'lab-002',
    patientId: 'pat-001',
    testName: 'Lipid Profile',
    testNameMr: 'लिपिड प्रोफाइल',
    category: 'lipid',
    date: '2026-09-01',
    labName: 'Metropolis Healthcare',
    labNameMr: 'मेट्रोपोलिस हेल्थकेअर',
    status: 'abnormal',
    doctorName: 'Dr. Rajesh Kulkarni',
    results: [
      { parameter: 'Total Cholesterol', parameterMr: 'एकूण कोलेस्ट्रॉल', value: '220', unit: 'mg/dL', normalRange: '<200', status: 'high' },
      { parameter: 'LDL Cholesterol', parameterMr: 'LDL कोलेस्ट्रॉल', value: '145', unit: 'mg/dL', normalRange: '<100', status: 'high' },
    ],
    notes: 'Elevated cholesterol levels. Dietary modifications recommended.',
    notesMr: 'कोलेस्ट्रॉल पातळी वाढलेली. आहारातील बदलांची शिफारस.',
    createdAt: '2026-09-01T10:00:00Z',
  },
]

const mockVaccinations: Vaccination[] = [
  {
    id: 'vac-001',
    patientId: 'pat-001',
    vaccineName: 'COVID-19 (Covishield)',
    vaccineNameMr: 'कोविड-19 (कोविशील्ड)',
    disease: 'COVID-19',
    diseaseMr: 'कोविड-19',
    doseNumber: 2,
    totalDoses: 2,
    date: '2021-06-15',
    batchNumber: 'BATCH2021A456',
    manufacturer: 'Serum Institute of India',
    administeredBy: 'Dr. Suresh Patil',
    facilityName: 'PHC Shirur',
    facilityNameMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    status: 'completed',
    certificateUrl: '/certificates/covid-vac.pdf',
    createdAt: '2021-06-15T10:00:00Z',
  },
  {
    id: 'vac-002',
    patientId: 'pat-001',
    vaccineName: 'Influenza (Flu Shot)',
    vaccineNameMr: 'इन्फ्लुएंझा (फ्लू शॉट)',
    disease: 'Seasonal Influenza',
    diseaseMr: 'हंगामी इन्फ्लुएंझा',
    doseNumber: 1,
    totalDoses: 1,
    date: '2026-10-15',
    nextDueDate: '2027-10-15',
    facilityName: 'Apollo Clinic',
    facilityNameMr: 'अपोलो क्लिनिक',
    status: 'scheduled',
    createdAt: '2026-09-01T10:00:00Z',
  },
]

const mockAllergies: Allergy[] = [
  {
    id: 'allergy-001',
    patientId: 'pat-001',
    allergen: 'Penicillin',
    allergenMr: 'पेनिसिलिन',
    type: 'drug',
    severity: 'severe',
    reaction: 'Severe skin rash, difficulty breathing',
    reactionMr: 'तीव्र त्वचेवर पुरळ, श्वास घेण्यात अडचण',
    diagnosedDate: '2018-07-20',
    diagnosedBy: 'Dr. Rajesh Kulkarni',
    status: 'active',
    createdAt: '2018-07-20T10:00:00Z',
  },
  {
    id: 'allergy-002',
    patientId: 'pat-001',
    allergen: 'Dust Mites',
    allergenMr: 'धूळ माइट्स',
    type: 'environmental',
    severity: 'moderate',
    reaction: 'Sneezing, runny nose, itchy eyes',
    reactionMr: 'शिंका येणे, नाक वाहणे, डोळ्यांना खाज',
    diagnosedDate: '2015-03-10',
    status: 'active',
    createdAt: '2015-03-10T10:00:00Z',
  },
]

const mockChronicConditions: ChronicCondition[] = [
  {
    id: 'cond-001',
    patientId: 'pat-001',
    condition: 'Hypertension (Essential)',
    conditionMr: 'उच्च रक्तदाब (आवश्यक)',
    icdCode: 'I10',
    diagnosedDate: '2022-05-15',
    diagnosedBy: 'Dr. Meena Sawant',
    status: 'managed',
    severity: 'moderate',
    medications: ['Amlodipine 5mg', 'Telmisartan 40mg'],
    notes: 'Well controlled with medication. Regular monitoring required.',
    notesMr: 'औषधांनी चांगले नियंत्रित. नियमित निरीक्षण आवश्यक.',
    lastReviewDate: '2026-08-01',
    nextReviewDate: '2026-11-01',
    createdAt: '2022-05-15T10:00:00Z',
  },
]

// Controller Functions

/**
 * Get all medical records for a patient
 */
export const getMedicalRecords = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params
    const { type, startDate, endDate, search } = req.query

    let records = mockMedicalRecords.filter(r => r.patientId === patientId || patientId === 'all')

    if (type && type !== 'all') {
      records = records.filter(r => r.type === type)
    }

    if (startDate) {
      records = records.filter(r => r.date >= (startDate as string))
    }

    if (endDate) {
      records = records.filter(r => r.date <= (endDate as string))
    }

    if (search) {
      const term = (search as string).toLowerCase()
      records = records.filter(r =>
        r.title.toLowerCase().includes(term) ||
        r.diagnosis?.toLowerCase().includes(term) ||
        r.doctorName?.toLowerCase().includes(term)
      )
    }

    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    res.json({
      success: true,
      data: records,
      total: records.length,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical records',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get a single medical record by ID
 */
export const getMedicalRecordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const record = mockMedicalRecords.find(r => r.id === id)

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found',
      })
    }

    res.json({
      success: true,
      data: record,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical record',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get all lab reports for a patient
 */
export const getLabReports = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params
    const { category, status, startDate, endDate } = req.query

    let reports = mockLabReports.filter(r => r.patientId === patientId || patientId === 'all')

    if (category && category !== 'all') {
      reports = reports.filter(r => r.category === category)
    }

    if (status && status !== 'all') {
      reports = reports.filter(r => r.status === status)
    }

    if (startDate) {
      reports = reports.filter(r => r.date >= (startDate as string))
    }

    if (endDate) {
      reports = reports.filter(r => r.date <= (endDate as string))
    }

    reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    res.json({
      success: true,
      data: reports,
      total: reports.length,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab reports',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get a single lab report by ID
 */
export const getLabReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const report = mockLabReports.find(r => r.id === id)

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Lab report not found',
      })
    }

    res.json({
      success: true,
      data: report,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab report',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get lab trends for a specific parameter
 */
export const getLabTrends = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params
    const { parameter } = req.query

    // Simulated trend data
    let trendData: { date: string; value: number }[] = []

    if ((parameter as string)?.toLowerCase().includes('cholesterol')) {
      trendData = [
        { date: '2025-03-01', value: 195 },
        { date: '2025-06-01', value: 205 },
        { date: '2025-09-01', value: 210 },
        { date: '2026-01-01', value: 215 },
        { date: '2026-05-01', value: 218 },
        { date: '2026-09-01', value: 220 },
      ]
    } else if ((parameter as string)?.toLowerCase().includes('hba1c')) {
      trendData = [
        { date: '2025-02-01', value: 5.4 },
        { date: '2025-08-01', value: 5.5 },
        { date: '2026-02-01', value: 5.6 },
        { date: '2026-08-01', value: 5.8 },
      ]
    }

    res.json({
      success: true,
      data: trendData,
      parameter,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab trends',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get all vaccinations for a patient
 */
export const getVaccinations = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params
    const { status } = req.query

    let vaccinations = mockVaccinations.filter(v => v.patientId === patientId || patientId === 'all')

    if (status && status !== 'all') {
      vaccinations = vaccinations.filter(v => v.status === status)
    }

    vaccinations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    res.json({
      success: true,
      data: vaccinations,
      total: vaccinations.length,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vaccinations',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get upcoming vaccinations for a patient
 */
export const getUpcomingVaccinations = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params

    const upcoming = mockVaccinations.filter(v =>
      (v.patientId === patientId || patientId === 'all') &&
      (v.status === 'scheduled' || v.status === 'due' || v.status === 'overdue')
    )

    res.json({
      success: true,
      data: upcoming,
      total: upcoming.length,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming vaccinations',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get all allergies for a patient
 */
export const getAllergies = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params

    const allergies = mockAllergies.filter(a => a.patientId === patientId || patientId === 'all')

    res.json({
      success: true,
      data: allergies,
      total: allergies.length,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch allergies',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Add a new allergy
 */
export const addAllergy = async (req: Request, res: Response) => {
  try {
    const allergyData = req.body

    const newAllergy: Allergy = {
      ...allergyData,
      id: `allergy-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    mockAllergies.push(newAllergy)

    res.status(201).json({
      success: true,
      data: newAllergy,
      message: 'Allergy added successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add allergy',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get all chronic conditions for a patient
 */
export const getChronicConditions = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params

    const conditions = mockChronicConditions.filter(c => c.patientId === patientId || patientId === 'all')

    res.json({
      success: true,
      data: conditions,
      total: conditions.length,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chronic conditions',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get health summary for a patient
 */
export const getHealthSummary = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params

    const records = mockMedicalRecords.filter(r => r.patientId === patientId)
    const allergies = mockAllergies.filter(a => a.patientId === patientId)
    const conditions = mockChronicConditions.filter(c => c.patientId === patientId)
    const vaccinations = mockVaccinations.filter(v =>
      v.patientId === patientId &&
      (v.status === 'scheduled' || v.status === 'due' || v.status === 'overdue')
    )
    const pendingLabs = mockLabReports.filter(r => r.patientId === patientId && r.status === 'pending')

    const consultations = records.filter(r => r.type === 'consultation')
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentConsultations = consultations.filter(c => new Date(c.date) >= thirtyDaysAgo)

    const summary = {
      totalRecords: records.length,
      recentConsultations: recentConsultations.length,
      upcomingVaccinations: vaccinations.length,
      activeAllergies: allergies.filter(a => a.status === 'active').length,
      chronicConditions: conditions.filter(c => c.status === 'active' || c.status === 'managed').length,
      pendingLabReports: pendingLabs.length,
      lastCheckupDate: consultations[0]?.date,
      bloodGroup: 'B+',
      height: '172 cm',
      weight: '68 kg',
      bmi: 23.0,
    }

    res.json({
      success: true,
      data: summary,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health summary',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Share records with a doctor
 */
export const shareRecords = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params
    const { doctorId, recordIds } = req.body

    // In a real implementation, this would create sharing permissions in the database
    console.log(`Sharing records ${recordIds.join(', ')} from patient ${patientId} with doctor ${doctorId}`)

    res.json({
      success: true,
      message: 'Records shared successfully',
      data: {
        patientId,
        doctorId,
        recordIds,
        sharedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to share records',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Export records
 */
export const exportRecords = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params
    const { format } = req.query

    // In a real implementation, this would generate and return the export file
    const exportUrl = `/api/health-records/export/${patientId}/download?format=${format || 'pdf'}`

    res.json({
      success: true,
      message: 'Export generated successfully',
      data: {
        downloadUrl: exportUrl,
        format: format || 'pdf',
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export records',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
