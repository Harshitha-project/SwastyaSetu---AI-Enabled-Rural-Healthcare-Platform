import api from './api'
import type { Doctor, ApiResponse } from '../types'

export const DEMO_DOCTORS: Doctor[] = [
  {
    id: 'doc-001',
    _id: 'doc-001',
    userId: 'u-doc-1',
    specialization: 'General Medicine & Cardiology',
    qualification: 'MBBS, MD (General Medicine)',
    registrationNumber: 'MMC-2012-08492',
    experience: 12,
    consultationFee: 300,
    teleconsultationEnabled: true,
    rating: 4.9,
    totalConsultations: 1420,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
    availability: [
      { day: 'Monday', startTime: '09:00 AM', endTime: '01:00 PM', maxAppointments: 10 },
      { day: 'Wednesday', startTime: '09:00 AM', endTime: '01:00 PM', maxAppointments: 10 },
      { day: 'Friday', startTime: '02:00 PM', endTime: '06:00 PM', maxAppointments: 10 },
    ],
    user: {
      id: 'u-doc-1',
      _id: 'u-doc-1',
      firstName: 'Dr. Rajesh',
      lastName: 'Patil',
      name: 'Dr. Rajesh Patil',
      email: 'doctor@demo.com',
      phone: '9876543211',
      role: 'DOCTOR',
      preferredLanguage: 'mr',
      isActive: true,
      createdAt: '2023-01-01',
      updatedAt: '2024-01-01',
    },
  },
  {
    id: 'doc-002',
    _id: 'doc-002',
    userId: 'u-doc-2',
    specialization: 'Pediatrics & Child Health',
    qualification: 'MBBS, DCH, DNB (Pediatrics)',
    registrationNumber: 'MMC-2015-11029',
    experience: 9,
    consultationFee: 250,
    teleconsultationEnabled: true,
    rating: 4.8,
    totalConsultations: 980,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
    availability: [
      { day: 'Tuesday', startTime: '10:00 AM', endTime: '02:00 PM', maxAppointments: 12 },
      { day: 'Thursday', startTime: '10:00 AM', endTime: '02:00 PM', maxAppointments: 12 },
      { day: 'Saturday', startTime: '09:00 AM', endTime: '01:00 PM', maxAppointments: 10 },
    ],
    user: {
      id: 'u-doc-2',
      _id: 'u-doc-2',
      firstName: 'Dr. Ananya',
      lastName: 'Deshmukh',
      name: 'Dr. Ananya Deshmukh',
      email: 'ananya.deshmukh@example.com',
      phone: '9823011223',
      role: 'DOCTOR',
      preferredLanguage: 'mr',
      isActive: true,
      createdAt: '2023-01-01',
      updatedAt: '2024-01-01',
    },
  },
  {
    id: 'doc-003',
    _id: 'doc-003',
    userId: 'u-doc-3',
    specialization: 'Gynecology & Maternal Health',
    qualification: 'MBBS, MS (Obstetrics & Gynecology)',
    registrationNumber: 'MMC-2010-04519',
    experience: 14,
    consultationFee: 350,
    teleconsultationEnabled: true,
    rating: 5.0,
    totalConsultations: 1850,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
    availability: [
      { day: 'Monday', startTime: '02:00 PM', endTime: '06:00 PM', maxAppointments: 8 },
      { day: 'Thursday', startTime: '02:00 PM', endTime: '06:00 PM', maxAppointments: 8 },
    ],
    user: {
      id: 'u-doc-3',
      _id: 'u-doc-3',
      firstName: 'Dr. Sunanda',
      lastName: 'Kulkarni',
      name: 'Dr. Sunanda Kulkarni',
      email: 'sunanda.kulkarni@example.com',
      phone: '9822456789',
      role: 'DOCTOR',
      preferredLanguage: 'mr',
      isActive: true,
      createdAt: '2023-01-01',
      updatedAt: '2024-01-01',
    },
  },
  {
    id: 'doc-004',
    _id: 'doc-004',
    userId: 'u-doc-4',
    specialization: 'Pulmonology & Respiratory Medicine',
    qualification: 'MBBS, MD (Pulmonary Medicine)',
    registrationNumber: 'MMC-2016-09218',
    experience: 8,
    consultationFee: 300,
    teleconsultationEnabled: true,
    rating: 4.7,
    totalConsultations: 720,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
    availability: [
      { day: 'Wednesday', startTime: '11:00 AM', endTime: '03:00 PM', maxAppointments: 8 },
      { day: 'Saturday', startTime: '02:00 PM', endTime: '06:00 PM', maxAppointments: 8 },
    ],
    user: {
      id: 'u-doc-4',
      _id: 'u-doc-4',
      firstName: 'Dr. Manoj',
      lastName: 'Shinde',
      name: 'Dr. Manoj Shinde',
      email: 'manoj.shinde@example.com',
      phone: '9821876543',
      role: 'DOCTOR',
      preferredLanguage: 'hi',
      isActive: true,
      createdAt: '2023-01-01',
      updatedAt: '2024-01-01',
    },
  },
  {
    id: 'doc-005',
    _id: 'doc-005',
    userId: 'u-doc-5',
    specialization: 'Dentistry & Oral Surgery',
    qualification: 'BDS, MDS (Oral & Maxillofacial Surgery)',
    registrationNumber: 'MSDC-2016-04491',
    experience: 9,
    consultationFee: 250,
    teleconsultationEnabled: true,
    rating: 4.9,
    totalConsultations: 1120,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
    availability: [
      { day: 'Monday', startTime: '10:00 AM', endTime: '02:00 PM', maxAppointments: 10 },
      { day: 'Tuesday', startTime: '10:00 AM', endTime: '02:00 PM', maxAppointments: 10 },
      { day: 'Thursday', startTime: '02:00 PM', endTime: '06:00 PM', maxAppointments: 10 },
      { day: 'Saturday', startTime: '10:00 AM', endTime: '01:00 PM', maxAppointments: 8 },
    ],
    user: {
      id: 'u-doc-5',
      _id: 'u-doc-5',
      firstName: 'Dr. Pooja',
      lastName: 'Shirodkar',
      name: 'Dr. Pooja Shirodkar',
      email: 'pooja.dentist@example.com',
      phone: '9822188432',
      role: 'DOCTOR',
      preferredLanguage: 'mr',
      isActive: true,
      createdAt: '2023-01-01',
      updatedAt: '2024-01-01',
    },
  },
  {
    id: 'doc-006',
    _id: 'doc-006',
    userId: 'u-doc-6',
    specialization: 'Dermatology & Skin Care',
    qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    registrationNumber: 'MMC-2014-07119',
    experience: 11,
    consultationFee: 300,
    teleconsultationEnabled: true,
    rating: 4.8,
    totalConsultations: 890,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
    availability: [
      { day: 'Tuesday', startTime: '02:00 PM', endTime: '06:00 PM', maxAppointments: 8 },
      { day: 'Friday', startTime: '10:00 AM', endTime: '02:00 PM', maxAppointments: 8 },
    ],
    user: {
      id: 'u-doc-6',
      _id: 'u-doc-6',
      firstName: 'Dr. Amit',
      lastName: 'Kulkarni',
      name: 'Dr. Amit Kulkarni',
      email: 'amit.skin@example.com',
      phone: '9822345671',
      role: 'DOCTOR',
      preferredLanguage: 'mr',
      isActive: true,
      createdAt: '2023-01-01',
      updatedAt: '2024-01-01',
    },
  },
  {
    id: 'doc-007',
    _id: 'doc-007',
    userId: 'u-doc-7',
    specialization: 'Orthopedics & Joint Care',
    qualification: 'MBBS, MS (Orthopedics)',
    registrationNumber: 'MMC-2011-03822',
    experience: 13,
    consultationFee: 350,
    teleconsultationEnabled: true,
    rating: 4.9,
    totalConsultations: 1340,
    createdAt: '2023-01-01',
    updatedAt: '2024-01-01',
    availability: [
      { day: 'Wednesday', startTime: '02:00 PM', endTime: '06:00 PM', maxAppointments: 8 },
      { day: 'Saturday', startTime: '09:00 AM', endTime: '01:00 PM', maxAppointments: 8 },
    ],
    user: {
      id: 'u-doc-7',
      _id: 'u-doc-7',
      firstName: 'Dr. Suresh',
      lastName: 'Jadhav',
      name: 'Dr. Suresh Jadhav',
      email: 'suresh.ortho@example.com',
      phone: '9822998811',
      role: 'DOCTOR',
      preferredLanguage: 'mr',
      isActive: true,
      createdAt: '2023-01-01',
      updatedAt: '2024-01-01',
    },
  },
]

export interface DoctorRecommendation {
  specialty: string
  specialtyLabelEn: string
  specialtyLabelMr: string
  specialtyLabelHi: string
  doctor: Doctor
  matchReasonEn: string
  matchReasonMr: string
  matchReasonHi: string
  urgency: 'ROUTINE' | 'PRIORITY' | 'IMMEDIATE'
  icon: string
}

export const doctorService = {
  getCustomDoctors(): Doctor[] {
    try {
      const stored = localStorage.getItem('swasthyasetu_custom_doctors')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  addDoctor(doctor: Doctor) {
    try {
      const existing = this.getCustomDoctors()
      const updated = [doctor, ...existing.filter(d => (d.id || d._id) !== (doctor.id || doctor._id))]
      localStorage.setItem('swasthyasetu_custom_doctors', JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save custom doctor', e)
    }
  },

  // Recommend specialist doctor based on symptoms and conditions
  async recommendDoctor(symptoms: string[], conditions: any[] = []): Promise<DoctorRecommendation | null> {
    const allDoctors = await this.getDoctors()
    const symStr = (symptoms || []).map(s => s.toLowerCase()).join(' ')
    const condStr = (conditions || []).map(c => (typeof c === 'string' ? c : c.condition || '')).join(' ').toLowerCase()
    const combined = `${symStr} ${condStr}`

    // 1. Dental / Dentistry
    if (
      combined.includes('tooth') ||
      combined.includes('teeth') ||
      combined.includes('dent') ||
      combined.includes('gum') ||
      combined.includes('cavity') ||
      combined.includes('cavities') ||
      combined.includes('mouth ulcer') ||
      combined.includes('oral') ||
      combined.includes('हिरड्या') ||
      combined.includes('दात')
    ) {
      const doc = allDoctors.find(d => d.specialization.toLowerCase().includes('dent')) || allDoctors[0]
      return {
        specialty: 'Dentistry & Oral Surgery',
        specialtyLabelEn: 'Dental Surgeon / Dentist',
        specialtyLabelMr: 'दंतचिकित्सक (Dentist)',
        specialtyLabelHi: 'दंत चिकित्सक (Dentist)',
        doctor: doc,
        matchReasonEn: 'Reported dental symptoms (toothache, gum swelling, cavities, or oral discomfort) require specialized examination by a Dental Surgeon.',
        matchReasonMr: 'दातदुखी, हिरड्यांमधून रक्त येणे किंवा किडणे या कारणांसाठी तज्ज्ञ दंतचिकित्सकांचा सल्ला आवश्यक आहे.',
        matchReasonHi: 'दांत दर्द, मसूड़ों में सूजन या कैविटी के लक्षणों के लिए योग्य दंत चिकित्सक (डेंटिस्ट) से परामर्श करें।',
        urgency: 'PRIORITY',
        icon: '🦷',
      }
    }

    // 2. Cardiology / Heart Issue
    if (
      combined.includes('chest pain') ||
      combined.includes('palpitation') ||
      combined.includes('heart') ||
      combined.includes('hypertension') ||
      combined.includes('high bp') ||
      combined.includes('छातीत') ||
      combined.includes('धडधड')
    ) {
      const doc = allDoctors.find(d => d.specialization.toLowerCase().includes('cardio') || d.specialization.toLowerCase().includes('general')) || allDoctors[0]
      return {
        specialty: 'General Medicine & Cardiology',
        specialtyLabelEn: 'Cardiologist & Physician',
        specialtyLabelMr: 'हृदयरोगतज्ज्ञ व फिजिशियन',
        specialtyLabelHi: 'हृदय रोग विशेषज्ञ एवं चिकित्सक',
        doctor: doc,
        matchReasonEn: 'Reported cardiovascular indicators warrant prompt clinical ECG and evaluation by a Cardiologist.',
        matchReasonMr: 'छातीत कळ किंवा रक्तदाब वाढण्याच्या लक्षणांसाठी तात्काळ हृदयरोगतज्ज्ञांची तपासणी आवश्यक आहे.',
        matchReasonHi: 'सीने में दर्द या ब्लड प्रेशर की समस्या के लिए तुरंत हृदय रोग विशेषज्ञ से परामर्श करें।',
        urgency: 'IMMEDIATE',
        icon: '❤️',
      }
    }

    // 3. Pulmonology / Respiratory
    if (
      combined.includes('cough') ||
      combined.includes('breathlessness') ||
      combined.includes('shortness of breath') ||
      combined.includes('asthma') ||
      combined.includes('wheez') ||
      combined.includes('pneumonia') ||
      combined.includes('खोकला') ||
      combined.includes('दम')
    ) {
      const doc = allDoctors.find(d => d.specialization.toLowerCase().includes('pulmon')) || allDoctors[0]
      return {
        specialty: 'Pulmonology & Respiratory Medicine',
        specialtyLabelEn: 'Pulmonologist / Chest Physician',
        specialtyLabelMr: 'श्वसनविकारतज्ज्ञ (Pulmonologist)',
        specialtyLabelHi: 'श्वसन रोग विशेषज्ञ (Pulmonologist)',
        doctor: doc,
        matchReasonEn: 'Persistent breathing difficulty, wheezing, or deep cough requires chest and pulmonary assessment.',
        matchReasonMr: 'श्वसनाचा त्रास, खोकला किंवा दमा या लक्षणांसाठी श्वसनतज्ज्ञांचे मार्गदर्शन आवश्यक आहे.',
        matchReasonHi: 'सांस लेने में तकलीफ या खांसी के लिए फेफड़े रोग विशेषज्ञ से परामर्श करें।',
        urgency: 'PRIORITY',
        icon: '🫁',
      }
    }

    // 4. Dermatology / Skin
    if (
      combined.includes('skin') ||
      combined.includes('rash') ||
      combined.includes('itch') ||
      combined.includes('fungal') ||
      combined.includes('boil') ||
      combined.includes('acne') ||
      combined.includes('खाज') ||
      combined.includes('पुरळ')
    ) {
      const doc = allDoctors.find(d => d.specialization.toLowerCase().includes('dermat')) || allDoctors[0]
      return {
        specialty: 'Dermatology & Skin Care',
        specialtyLabelEn: 'Dermatologist / Skin Specialist',
        specialtyLabelMr: 'त्वचारोगतज्ज्ञ (Dermatologist)',
        specialtyLabelHi: 'त्वचा रोग विशेषज्ञ (Dermatologist)',
        doctor: doc,
        matchReasonEn: 'Skin rashes, fungal infection, or dermal lesions require dermatological inspection.',
        matchReasonMr: 'त्वचेवरील खाज, पुरळ किंवा संसर्गासाठी त्वचारोगतज्ज्ञांचा सल्ला घ्या.',
        matchReasonHi: 'त्वचा पर चकत्ते, खुजली या संक्रमण के लिए त्वचा विशेषज्ञ से परामर्श करें।',
        urgency: 'ROUTINE',
        icon: '🧴',
      }
    }

    // 5. Orthopedics / Joint
    if (
      combined.includes('joint') ||
      combined.includes('backache') ||
      combined.includes('fracture') ||
      combined.includes('bone') ||
      combined.includes('knee') ||
      combined.includes('arthritis') ||
      combined.includes('सांधेदुखी') ||
      combined.includes('कंबरदुखी')
    ) {
      const doc = allDoctors.find(d => d.specialization.toLowerCase().includes('ortho')) || allDoctors[0]
      return {
        specialty: 'Orthopedics & Joint Care',
        specialtyLabelEn: 'Orthopedic Surgeon / Bone Specialist',
        specialtyLabelMr: 'अस्थिरोगतज्ज्ञ (Orthopedic Specialist)',
        specialtyLabelHi: 'हड्डी एवं जोड़ विशेषज्ञ (Orthopedic)',
        doctor: doc,
        matchReasonEn: 'Musculoskeletal or joint pain requires clinical assessment by an Orthopedic specialist.',
        matchReasonMr: 'सांधेदुखी, मणक्याचे किंवा हाडांचे दुखणे यासाठी अस्थिरोगतज्ज्ञांचा सल्ला घ्या.',
        matchReasonHi: 'जोड़ों या हड्डियों के दर्द के लिए हड्डी रोग विशेषज्ञ से जांच कराएं।',
        urgency: 'ROUTINE',
        icon: '🦴',
      }
    }

    // 6. Pediatrics / Child
    if (
      combined.includes('child') ||
      combined.includes('pediatric') ||
      combined.includes('infant') ||
      combined.includes('baby') ||
      combined.includes('measles') ||
      combined.includes('बाळ')
    ) {
      const doc = allDoctors.find(d => d.specialization.toLowerCase().includes('pediat')) || allDoctors[0]
      return {
        specialty: 'Pediatrics & Child Health',
        specialtyLabelEn: 'Pediatrician / Child Specialist',
        specialtyLabelMr: 'बालरोगतज्ज्ञ (Pediatrician)',
        specialtyLabelHi: 'शिशु एवं बाल रोग विशेषज्ञ',
        doctor: doc,
        matchReasonEn: 'Child health symptoms require specialized pediatric consultation and monitored dosing.',
        matchReasonMr: 'लहान मुलांच्या आजारांवर बालरोगतज्ज्ञांचे अचूक मार्गदर्शन आवश्यक आहे.',
        matchReasonHi: 'बच्चों की स्वास्थ्य समस्याओं के लिए बाल रोग विशेषज्ञ से परामर्श लें।',
        urgency: 'PRIORITY',
        icon: '👶',
      }
    }

    // 7. Gynecology / Maternal
    if (
      combined.includes('pregnan') ||
      combined.includes('period') ||
      combined.includes('menstru') ||
      combined.includes('pelvic') ||
      combined.includes('maternal') ||
      combined.includes('गर्भवती')
    ) {
      const doc = allDoctors.find(d => d.specialization.toLowerCase().includes('gynec')) || allDoctors[0]
      return {
        specialty: 'Gynecology & Maternal Health',
        specialtyLabelEn: 'Gynecologist & Obstetrician',
        specialtyLabelMr: 'स्त्रीरोग व प्रसूतीतज्ज्ञ (Gynecologist)',
        specialtyLabelHi: 'स्त्री रोग एवं प्रसूति विशेषज्ञ',
        doctor: doc,
        matchReasonEn: 'Maternal or reproductive health indicators should be examined by a certified Gynecologist.',
        matchReasonMr: 'स्त्रीरोग किंवा गर्भावस्थेच्या आरोग्यासाठी तज्ज्ञ स्त्रीरोगतज्ज्ञांचा सल्ला आवश्यक आहे.',
        matchReasonHi: 'मातृ स्वास्थ्य या महिला रोग संबंधी लक्षणों के लिए स्त्री रोग विशेषज्ञ से मिलें।',
        urgency: 'PRIORITY',
        icon: '🌸',
      }
    }

    // 8. Default: General Physician
    const defaultDoc = allDoctors[0]
    return {
      specialty: 'General Medicine & Cardiology',
      specialtyLabelEn: 'General Physician / Medical Officer',
      specialtyLabelMr: 'जनरल फिजिशियन / वैद्यकीय अधिकारी',
      specialtyLabelHi: 'सामान्य चिकित्सक / मेडिकल ऑफिसर',
      doctor: defaultDoc,
      matchReasonEn: 'General systemic symptoms, fever, or viral illness should be diagnosed by an Internal Medicine Specialist.',
      matchReasonMr: 'ताप, अशक्तपणा किंवा सामान्य आजारांसाठी तज्ज्ञ फिजिशियन डॉक्टरांचा सल्ला घ्या.',
      matchReasonHi: 'बुखार, कमजोरी या सामान्य लक्षणों के लिए अनुभवी चिकित्सक से परामर्श लें।',
      urgency: 'ROUTINE',
      icon: '🩺',
    }
  },

  // Get list of doctors with optional filtering
  async getDoctors(params?: { specialization?: string; district?: string; search?: string }): Promise<Doctor[]> {
    try {
      const res = await api.get<ApiResponse<Doctor[]>>('/doctors', { params })
      if (res.data?.data && res.data.data.length > 0) return res.data.data
    } catch (err) {
      console.warn('API getDoctors fallback to local', err)
    }

    const custom = this.getCustomDoctors()
    let filtered = [...custom, ...DEMO_DOCTORS]
    if (params?.specialization && params.specialization !== 'all') {
      filtered = filtered.filter(d => d.specialization.toLowerCase().includes(params.specialization!.toLowerCase()))
    }
    if (params?.search) {
      const query = params.search.toLowerCase()
      filtered = filtered.filter(d => 
        (d.user as any)?.firstName?.toLowerCase().includes(query) ||
        (d.user as any)?.lastName?.toLowerCase().includes(query) ||
        (d.user as any)?.name?.toLowerCase().includes(query) ||
        d.specialization.toLowerCase().includes(query)
      )
    }
    return filtered
  },

  // Get doctor by ID
  async getDoctorById(id: string): Promise<Doctor | undefined> {
    try {
      const res = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`)
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getDoctorById fallback to local', err)
    }
    const all = [...this.getCustomDoctors(), ...DEMO_DOCTORS]
    return all.find(d => d.id === id || d._id === id)
  },

  // Get available slots for a doctor on a specific date
  async getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
    try {
      const res = await api.get<ApiResponse<string[]>>(`/doctors/${doctorId}/slots`, { params: { date } })
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getAvailableSlots fallback to local', err)
    }
    // Default morning and afternoon time slots
    return [
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
    ]
  },

  // Get distinct specializations
  async getSpecializations(): Promise<string[]> {
    try {
      const res = await api.get<ApiResponse<string[]>>('/doctors/specializations')
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getSpecializations fallback to local', err)
    }
    return [
      'Dentistry & Oral Surgery',
      'General Medicine & Cardiology',
      'Pediatrics & Child Health',
      'Gynecology & Maternal Health',
      'Pulmonology & Respiratory Medicine',
      'Dermatology & Skin Care',
      'Orthopedics & Joint Care',
      'Psychiatry & Mental Health',
    ]
  },

  // Get current logged-in doctor profile & dashboard stats
  async getDoctorStats(): Promise<any> {
    try {
      const res = await api.get<ApiResponse<any>>('/doctors/me/stats')
      if (res.data?.data) return res.data.data
    } catch (err) {
      console.warn('API getDoctorStats fallback to local', err)
    }
    return {
      totalPatients: 142,
      todayAppointments: 6,
      pendingConsultations: 2,
      highRiskPatients: 5,
    }
  }
}
