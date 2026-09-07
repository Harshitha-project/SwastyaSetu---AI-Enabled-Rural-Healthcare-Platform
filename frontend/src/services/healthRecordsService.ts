/**
 * Health Records Service
 * Manages medical history, lab reports, vaccinations, allergies, and documents
 */

// Types
export interface MedicalRecord {
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
  attachments?: Attachment[]
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  id: string
  name: string
  type: 'pdf' | 'image' | 'document'
  url: string
  size: number
  uploadedAt: string
}

export interface LabReport {
  id: string
  patientId: string
  testName: string
  testNameMr: string
  category: 'blood' | 'urine' | 'imaging' | 'cardiac' | 'thyroid' | 'liver' | 'kidney' | 'diabetes' | 'lipid' | 'other'
  date: string
  labName: string
  labNameMr: string
  status: 'pending' | 'completed' | 'abnormal'
  results: LabResult[]
  doctorName?: string
  notes?: string
  notesMr?: string
  attachmentUrl?: string
  createdAt: string
}

export interface LabResult {
  parameter: string
  parameterMr: string
  value: string
  unit: string
  normalRange: string
  status: 'normal' | 'low' | 'high' | 'critical'
}

export interface Vaccination {
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
  sideEffects?: string
  status: 'completed' | 'due' | 'overdue' | 'scheduled'
  certificateUrl?: string
  createdAt: string
}

export interface Allergy {
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
  notes?: string
  status: 'active' | 'resolved' | 'suspected'
  createdAt: string
}

export interface ChronicCondition {
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

export interface MedicalDocument {
  id: string
  patientId: string
  name: string
  category: 'prescription' | 'lab_report' | 'discharge_summary' | 'insurance' | 'imaging' | 'certificate' | 'other'
  description?: string
  fileType: string
  fileSize: number
  fileUrl: string
  uploadedAt: string
  tags?: string[]
  sharedWith?: string[]
}

export interface HealthSummary {
  totalRecords: number
  recentConsultations: number
  upcomingVaccinations: number
  activeAllergies: number
  chronicConditions: number
  pendingLabReports: number
  lastCheckupDate?: string
  bloodGroup?: string
  height?: string
  weight?: string
  bmi?: number
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
  {
    id: 'rec-003',
    patientId: 'pat-001',
    type: 'surgery',
    title: 'Appendectomy',
    titleMr: 'अपेंडिक्स शस्त्रक्रिया',
    description: 'Laparoscopic appendectomy for acute appendicitis',
    descriptionMr: 'तीव्र अपेंडिसाइटिससाठी लॅपरोस्कोपिक अपेंडेक्टॉमी',
    date: '2025-03-10',
    doctorName: 'Dr. Vikram Joshi',
    facilityName: 'Ruby Hall Clinic',
    facilityNameMr: 'रुबी हॉल क्लिनिक',
    diagnosis: 'Acute Appendicitis',
    diagnosisMr: 'तीव्र अपेंडिसाइटिस',
    metadata: {
      surgeryType: 'Laparoscopic',
      duration: '45 minutes',
      anesthesia: 'General',
    },
    createdAt: '2025-03-10T09:00:00Z',
    updatedAt: '2025-03-10T12:00:00Z',
  },
  {
    id: 'rec-004',
    patientId: 'pat-001',
    type: 'prescription',
    title: 'Hypertension Medication',
    titleMr: 'उच्च रक्तदाब औषधे',
    description: 'Monthly prescription for blood pressure management',
    descriptionMr: 'रक्तदाब व्यवस्थापनासाठी मासिक प्रिस्क्रिप्शन',
    date: '2026-09-01',
    doctorName: 'Dr. Meena Sawant',
    facilityName: 'PHC Shirur',
    facilityNameMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    createdAt: '2026-09-01T16:00:00Z',
    updatedAt: '2026-09-01T16:00:00Z',
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
      { parameter: 'RBC Count', parameterMr: 'RBC गणना', value: '5.1', unit: 'million/μL', normalRange: '4.5-5.5', status: 'normal' },
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
      { parameter: 'HDL Cholesterol', parameterMr: 'HDL कोलेस्ट्रॉल', value: '42', unit: 'mg/dL', normalRange: '>40', status: 'normal' },
      { parameter: 'Triglycerides', parameterMr: 'ट्रायग्लिसराइड्स', value: '165', unit: 'mg/dL', normalRange: '<150', status: 'high' },
    ],
    notes: 'Elevated cholesterol levels. Dietary modifications recommended.',
    notesMr: 'कोलेस्ट्रॉल पातळी वाढलेली. आहारातील बदलांची शिफारस.',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'lab-003',
    patientId: 'pat-001',
    testName: 'HbA1c (Glycated Hemoglobin)',
    testNameMr: 'HbA1c (ग्लायकेटेड हिमोग्लोबिन)',
    category: 'diabetes',
    date: '2026-08-15',
    labName: 'SRL Diagnostics',
    labNameMr: 'SRL डायग्नोस्टिक्स',
    status: 'completed',
    doctorName: 'Dr. Meena Sawant',
    results: [
      { parameter: 'HbA1c', parameterMr: 'HbA1c', value: '5.8', unit: '%', normalRange: '<5.7', status: 'high' },
      { parameter: 'Estimated Average Glucose', parameterMr: 'अंदाजे सरासरी ग्लुकोज', value: '120', unit: 'mg/dL', normalRange: '<117', status: 'high' },
    ],
    notes: 'Prediabetic range. Lifestyle modifications advised.',
    notesMr: 'प्री-डायबेटिक श्रेणी. जीवनशैली बदलांचा सल्ला.',
    createdAt: '2026-08-15T11:00:00Z',
  },
  {
    id: 'lab-004',
    patientId: 'pat-001',
    testName: 'Thyroid Profile',
    testNameMr: 'थायरॉइड प्रोफाइल',
    category: 'thyroid',
    date: '2026-07-20',
    labName: 'Dr. Lal PathLabs',
    labNameMr: 'डॉ. लाल पॅथलॅब्स',
    status: 'completed',
    doctorName: 'Dr. Anjali Desai',
    results: [
      { parameter: 'TSH', parameterMr: 'TSH', value: '2.5', unit: 'mIU/L', normalRange: '0.4-4.0', status: 'normal' },
      { parameter: 'T3', parameterMr: 'T3', value: '1.2', unit: 'ng/mL', normalRange: '0.8-2.0', status: 'normal' },
      { parameter: 'T4', parameterMr: 'T4', value: '8.5', unit: 'μg/dL', normalRange: '5.0-12.0', status: 'normal' },
    ],
    notes: 'Thyroid function normal',
    notesMr: 'थायरॉइड कार्य सामान्य',
    createdAt: '2026-07-20T09:30:00Z',
  },
  {
    id: 'lab-005',
    patientId: 'pat-001',
    testName: 'Kidney Function Test (KFT)',
    testNameMr: 'किडनी कार्य चाचणी (KFT)',
    category: 'kidney',
    date: '2026-09-01',
    labName: 'Metropolis Healthcare',
    labNameMr: 'मेट्रोपोलिस हेल्थकेअर',
    status: 'completed',
    results: [
      { parameter: 'Creatinine', parameterMr: 'क्रिएटिनिन', value: '0.9', unit: 'mg/dL', normalRange: '0.7-1.3', status: 'normal' },
      { parameter: 'Blood Urea', parameterMr: 'ब्लड युरिया', value: '28', unit: 'mg/dL', normalRange: '15-40', status: 'normal' },
      { parameter: 'Uric Acid', parameterMr: 'युरिक ऍसिड', value: '5.5', unit: 'mg/dL', normalRange: '3.5-7.2', status: 'normal' },
    ],
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
    vaccineName: 'COVID-19 Booster (Corbevax)',
    vaccineNameMr: 'कोविड-19 बूस्टर (कोर्बेव्हॅक्स)',
    disease: 'COVID-19',
    diseaseMr: 'कोविड-19',
    doseNumber: 1,
    totalDoses: 1,
    date: '2022-08-20',
    batchNumber: 'CORBEV2022X789',
    manufacturer: 'Biological E Limited',
    administeredBy: 'ANM Sunita',
    facilityName: 'PHC Shirur',
    facilityNameMr: 'प्राथमिक आरोग्य केंद्र शिरूर',
    status: 'completed',
    createdAt: '2022-08-20T11:30:00Z',
  },
  {
    id: 'vac-003',
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
  {
    id: 'vac-004',
    patientId: 'pat-001',
    vaccineName: 'Hepatitis B',
    vaccineNameMr: 'हेपेटायटिस बी',
    disease: 'Hepatitis B',
    diseaseMr: 'हेपेटायटिस बी',
    doseNumber: 3,
    totalDoses: 3,
    date: '2020-03-15',
    batchNumber: 'HEPB2020C123',
    manufacturer: 'Serum Institute of India',
    facilityName: 'District Hospital Pune',
    facilityNameMr: 'जिल्हा रुग्णालय पुणे',
    status: 'completed',
    createdAt: '2020-03-15T09:00:00Z',
  },
  {
    id: 'vac-005',
    patientId: 'pat-001',
    vaccineName: 'Tetanus Toxoid (TT)',
    vaccineNameMr: 'टिटॅनस टॉक्सॉइड (TT)',
    disease: 'Tetanus',
    diseaseMr: 'टिटॅनस',
    doseNumber: 1,
    totalDoses: 1,
    date: '2024-05-10',
    nextDueDate: '2034-05-10',
    facilityName: 'PHC Baramati',
    facilityNameMr: 'प्राथमिक आरोग्य केंद्र बारामती',
    status: 'completed',
    createdAt: '2024-05-10T14:00:00Z',
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
    notes: 'Worsens during winter and monsoon',
    createdAt: '2015-03-10T10:00:00Z',
  },
  {
    id: 'allergy-003',
    patientId: 'pat-001',
    allergen: 'Shellfish',
    allergenMr: 'शेलफिश',
    type: 'food',
    severity: 'moderate',
    reaction: 'Stomach cramps, nausea, hives',
    reactionMr: 'पोटात पेटके, मळमळ, अंगावर गांधी',
    diagnosedDate: '2020-11-15',
    status: 'active',
    createdAt: '2020-11-15T10:00:00Z',
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
  {
    id: 'cond-002',
    patientId: 'pat-001',
    condition: 'Prediabetes',
    conditionMr: 'प्री-डायबेटिस',
    icdCode: 'R73.03',
    diagnosedDate: '2026-08-15',
    diagnosedBy: 'Dr. Rajesh Kulkarni',
    status: 'active',
    severity: 'mild',
    notes: 'Lifestyle modifications - diet and exercise. Recheck HbA1c in 3 months.',
    notesMr: 'जीवनशैली बदल - आहार आणि व्यायाम. 3 महिन्यांत HbA1c पुन्हा तपासा.',
    lastReviewDate: '2026-08-15',
    nextReviewDate: '2026-11-15',
    createdAt: '2026-08-15T10:00:00Z',
  },
]

const mockDocuments: MedicalDocument[] = [
  {
    id: 'doc-001',
    patientId: 'pat-001',
    name: 'Discharge Summary - Dengue 2026',
    category: 'discharge_summary',
    description: 'Discharge summary from Sassoon Hospital for dengue treatment',
    fileType: 'pdf',
    fileSize: 245000,
    fileUrl: '/documents/discharge-dengue-2026.pdf',
    uploadedAt: '2026-06-25T11:00:00Z',
    tags: ['dengue', 'hospitalization', '2026'],
  },
  {
    id: 'doc-002',
    patientId: 'pat-001',
    name: 'Surgery Report - Appendectomy 2025',
    category: 'discharge_summary',
    description: 'Post-operative report for laparoscopic appendectomy',
    fileType: 'pdf',
    fileSize: 180000,
    fileUrl: '/documents/surgery-appendix-2025.pdf',
    uploadedAt: '2025-03-12T10:00:00Z',
    tags: ['surgery', 'appendix', '2025'],
  },
  {
    id: 'doc-003',
    patientId: 'pat-001',
    name: 'COVID Vaccination Certificate',
    category: 'certificate',
    description: 'CoWIN vaccination certificate',
    fileType: 'pdf',
    fileSize: 120000,
    fileUrl: '/documents/covid-certificate.pdf',
    uploadedAt: '2022-08-20T12:00:00Z',
    tags: ['vaccination', 'covid', 'certificate'],
  },
  {
    id: 'doc-004',
    patientId: 'pat-001',
    name: 'Chest X-Ray Report',
    category: 'imaging',
    description: 'Routine chest X-ray - Normal findings',
    fileType: 'image',
    fileSize: 2500000,
    fileUrl: '/documents/xray-chest-2026.jpg',
    uploadedAt: '2026-08-15T14:00:00Z',
    tags: ['imaging', 'xray', 'chest'],
  },
  {
    id: 'doc-005',
    patientId: 'pat-001',
    name: 'Ayushman Bharat Card',
    category: 'insurance',
    description: 'PMJAY beneficiary card',
    fileType: 'image',
    fileSize: 450000,
    fileUrl: '/documents/ayushman-card.jpg',
    uploadedAt: '2024-01-15T10:00:00Z',
    tags: ['insurance', 'ayushman', 'pmjay'],
  },
]

// Service Functions
class HealthRecordsService {
  // Medical Records
  async getMedicalRecords(patientId: string, filters?: {
    type?: MedicalRecord['type']
    startDate?: string
    endDate?: string
    searchTerm?: string
  }): Promise<MedicalRecord[]> {
    await this.simulateDelay()
    
    let customRecords: MedicalRecord[] = []
    try {
      customRecords = JSON.parse(localStorage.getItem('swasthyasetu_custom_medical_records') || '[]')
    } catch {}

    const allRecords = [...customRecords, ...mockMedicalRecords]
    let records = allRecords.filter(r => r.patientId === patientId || patientId === 'all')
    
    if (filters?.type) {
      records = records.filter(r => r.type === filters.type)
    }
    
    if (filters?.startDate) {
      records = records.filter(r => r.date >= filters.startDate!)
    }
    
    if (filters?.endDate) {
      records = records.filter(r => r.date <= filters.endDate!)
    }
    
    if (filters?.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      records = records.filter(r =>
        r.title.toLowerCase().includes(term) ||
        r.titleMr.includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.diagnosis?.toLowerCase().includes(term) ||
        r.doctorName?.toLowerCase().includes(term)
      )
    }
    
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async getMedicalRecordById(id: string): Promise<MedicalRecord | null> {
    await this.simulateDelay()
    try {
      const customRecords: MedicalRecord[] = JSON.parse(localStorage.getItem('swasthyasetu_custom_medical_records') || '[]')
      const match = customRecords.find(r => r.id === id)
      if (match) return match
    } catch {}
    return mockMedicalRecords.find(r => r.id === id) || null
  }

  async addMedicalRecord(record: Partial<MedicalRecord>): Promise<MedicalRecord> {
    await this.simulateDelay()
    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      patientId: record.patientId || 'pat-001',
      type: record.type || 'consultation',
      title: record.title || 'Medical Record',
      titleMr: record.titleMr || record.title || 'वैद्यकीय नोंद',
      description: record.description || '',
      descriptionMr: record.descriptionMr || record.description || '',
      date: record.date || new Date().toISOString().split('T')[0],
      doctorName: record.doctorName,
      facilityName: record.facilityName || 'Primary Health Center',
      facilityNameMr: record.facilityNameMr || record.facilityName || 'प्राथमिक आरोग्य केंद्र',
      diagnosis: record.diagnosis,
      diagnosisMr: record.diagnosisMr || record.diagnosis,
      attachments: record.attachments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      const custom = JSON.parse(localStorage.getItem('swasthyasetu_custom_medical_records') || '[]')
      custom.unshift(newRecord)
      localStorage.setItem('swasthyasetu_custom_medical_records', JSON.stringify(custom))
    } catch {}

    mockMedicalRecords.unshift(newRecord)
    return newRecord
  }

  // Lab Reports
  async getLabReports(patientId: string, filters?: {
    category?: LabReport['category']
    status?: LabReport['status']
    startDate?: string
    endDate?: string
  }): Promise<LabReport[]> {
    await this.simulateDelay()
    
    let customReports: LabReport[] = []
    try {
      customReports = JSON.parse(localStorage.getItem('swasthyasetu_custom_lab_reports') || '[]')
    } catch {}

    const allReports = [...customReports, ...mockLabReports]
    let reports = allReports.filter(r => r.patientId === patientId || patientId === 'all')
    
    if (filters?.category) {
      reports = reports.filter(r => r.category === filters.category)
    }
    
    if (filters?.status) {
      reports = reports.filter(r => r.status === filters.status)
    }
    
    if (filters?.startDate) {
      reports = reports.filter(r => r.date >= filters.startDate!)
    }
    
    if (filters?.endDate) {
      reports = reports.filter(r => r.date <= filters.endDate!)
    }
    
    return reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async getLabReportById(id: string): Promise<LabReport | null> {
    await this.simulateDelay()
    try {
      const customReports: LabReport[] = JSON.parse(localStorage.getItem('swasthyasetu_custom_lab_reports') || '[]')
      const match = customReports.find(r => r.id === id)
      if (match) return match
    } catch {}
    return mockLabReports.find(r => r.id === id) || null
  }

  async addLabReport(report: Partial<LabReport>): Promise<LabReport> {
    await this.simulateDelay()
    const newReport: LabReport = {
      id: `lab-${Date.now()}`,
      patientId: report.patientId || 'pat-001',
      testName: report.testName || 'Diagnostic Lab Report',
      testNameMr: report.testNameMr || report.testName || 'प्रयोगशाळा अहवाल',
      category: report.category || 'blood',
      date: report.date || new Date().toISOString().split('T')[0],
      labName: report.labName || 'Local Diagnostic Lab',
      labNameMr: report.labNameMr || report.labName || 'स्थानिक पॅथॉलॉजी लॅब',
      status: report.status || 'completed',
      results: report.results && report.results.length > 0 ? report.results : [
        {
          parameter: 'Primary Diagnostic Finding',
          parameterMr: 'प्राथमिक चाचणी निष्कर्ष',
          value: 'Observed / Within Range',
          unit: '-',
          normalRange: 'Normal',
          status: 'normal',
        }
      ],
      doctorName: report.doctorName,
      notes: report.notes || 'Uploaded manually by patient/health worker.',
      notesMr: report.notesMr || report.notes || 'रुग्ण किंवा आरोग्य सेवकाने स्वतः अपलोड केलेला अहवाल.',
      attachmentUrl: report.attachmentUrl,
      createdAt: new Date().toISOString(),
    }

    try {
      const custom = JSON.parse(localStorage.getItem('swasthyasetu_custom_lab_reports') || '[]')
      custom.unshift(newReport)
      localStorage.setItem('swasthyasetu_custom_lab_reports', JSON.stringify(custom))
    } catch {}

    mockLabReports.unshift(newReport)
    return newReport
  }

  async getLabTrends(patientId: string, parameter: string): Promise<{ date: string; value: number }[]> {
    await this.simulateDelay()
    
    // Simulated trend data for cholesterol
    if (parameter.toLowerCase().includes('cholesterol')) {
      return [
        { date: '2025-03-01', value: 195 },
        { date: '2025-06-01', value: 205 },
        { date: '2025-09-01', value: 210 },
        { date: '2026-01-01', value: 215 },
        { date: '2026-05-01', value: 218 },
        { date: '2026-09-01', value: 220 },
      ]
    }
    
    if (parameter.toLowerCase().includes('hba1c')) {
      return [
        { date: '2025-02-01', value: 5.4 },
        { date: '2025-08-01', value: 5.5 },
        { date: '2026-02-01', value: 5.6 },
        { date: '2026-08-01', value: 5.8 },
      ]
    }
    
    return []
  }

  // Vaccinations
  async getVaccinations(patientId: string, filters?: {
    status?: Vaccination['status']
  }): Promise<Vaccination[]> {
    await this.simulateDelay()
    
    let vaccinations = mockVaccinations.filter(v => v.patientId === patientId || patientId === 'all')
    
    if (filters?.status) {
      vaccinations = vaccinations.filter(v => v.status === filters.status)
    }
    
    return vaccinations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  async getUpcomingVaccinations(patientId: string): Promise<Vaccination[]> {
    await this.simulateDelay()
    
    return mockVaccinations.filter(v =>
      (v.patientId === patientId || patientId === 'all') &&
      (v.status === 'scheduled' || v.status === 'due' || v.status === 'overdue')
    )
  }

  // Allergies
  async getAllergies(patientId: string): Promise<Allergy[]> {
    await this.simulateDelay()
    return mockAllergies.filter(a => a.patientId === patientId || patientId === 'all')
  }

  async addAllergy(allergy: Omit<Allergy, 'id' | 'createdAt'>): Promise<Allergy> {
    await this.simulateDelay()
    const newAllergy: Allergy = {
      ...allergy,
      id: `allergy-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    mockAllergies.push(newAllergy)
    return newAllergy
  }

  // Chronic Conditions
  async getChronicConditions(patientId: string): Promise<ChronicCondition[]> {
    await this.simulateDelay()
    return mockChronicConditions.filter(c => c.patientId === patientId || patientId === 'all')
  }

  // Documents
  async getDocuments(patientId: string, filters?: {
    category?: MedicalDocument['category']
    searchTerm?: string
  }): Promise<MedicalDocument[]> {
    await this.simulateDelay()
    
    let documents = mockDocuments.filter(d => d.patientId === patientId || patientId === 'all')
    
    if (filters?.category) {
      documents = documents.filter(d => d.category === filters.category)
    }
    
    if (filters?.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      documents = documents.filter(d =>
        d.name.toLowerCase().includes(term) ||
        d.description?.toLowerCase().includes(term) ||
        d.tags?.some(t => t.toLowerCase().includes(term))
      )
    }
    
    return documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  }

  async uploadDocument(document: Omit<MedicalDocument, 'id' | 'uploadedAt'>): Promise<MedicalDocument> {
    await this.simulateDelay()
    const newDoc: MedicalDocument = {
      ...document,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    }
    mockDocuments.push(newDoc)
    return newDoc
  }

  // Health Summary
  async getHealthSummary(patientId: string): Promise<HealthSummary> {
    await this.simulateDelay()
    
    const records = await this.getMedicalRecords(patientId)
    const allergies = await this.getAllergies(patientId)
    const conditions = await this.getChronicConditions(patientId)
    const vaccinations = await this.getUpcomingVaccinations(patientId)
    const labReports = await this.getLabReports(patientId, { status: 'pending' })
    
    const consultations = records.filter(r => r.type === 'consultation')
    const recentConsultations = consultations.filter(c => {
      const date = new Date(c.date)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return date >= thirtyDaysAgo
    })
    
    return {
      totalRecords: records.length,
      recentConsultations: recentConsultations.length,
      upcomingVaccinations: vaccinations.length,
      activeAllergies: allergies.filter(a => a.status === 'active').length,
      chronicConditions: conditions.filter(c => c.status === 'active' || c.status === 'managed').length,
      pendingLabReports: labReports.length,
      lastCheckupDate: consultations[0]?.date,
      bloodGroup: 'B+',
      height: '172 cm',
      weight: '68 kg',
      bmi: 23.0,
    }
  }

  // Share Records
  async shareRecordsWithDoctor(patientId: string, doctorId: string, recordIds: string[]): Promise<boolean> {
    await this.simulateDelay()
    console.log(`Sharing records ${recordIds.join(', ')} with doctor ${doctorId}`)
    return true
  }

  // Export Records
  async exportRecords(patientId: string, format: 'pdf' | 'json'): Promise<string> {
    await this.simulateDelay()
    // In real implementation, this would generate and return a download URL
    return `/api/health-records/export/${patientId}?format=${format}`
  }

  // Utility
  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 300))
  }
}

export const healthRecordsService = new HealthRecordsService()
