/**
 * Database Seeding Script for SwasthyaSetu
 * Creates demo accounts for all user roles and sample data
 * 
 * Run: npm run seed
 */

import { PrismaClient, UserRole, Gender, FacilityType, ArticleCategory, AppointmentStatus, AppointmentType } from '@prisma/client'
import { hashPassword } from '../utils/password.utils'

const prisma = new PrismaClient()

// Demo user accounts - 4 Patients, 4 Doctors, 1 Health Worker, 1 Admin
const DEMO_USERS = [
  // === PATIENTS ===
  {
    email: 'patient@demo.com',
    password: 'password123',
    phone: '9876543210',
    firstName: 'Priya',
    lastName: 'Sharma',
    role: 'PATIENT' as UserRole,
    preferredLanguage: 'en',
    patientData: {
      dateOfBirth: new Date('1990-05-15'),
      gender: 'FEMALE' as Gender,
      bloodGroup: 'B+',
      height: 160,
      weight: 55,
      village: 'Phaltan',
      taluka: 'Phaltan',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415523',
      emergencyName: 'Ramesh Sharma',
      emergencyPhone: '9876543220',
      emergencyRelation: 'Husband',
      allergies: ['Penicillin'],
      chronicConditions: [],
      currentMedications: [],
    },
  },
  {
    email: 'patient2@demo.com',
    password: 'password123',
    phone: '9876543214',
    firstName: 'Ramesh',
    lastName: 'Patil',
    role: 'PATIENT' as UserRole,
    preferredLanguage: 'mr',
    patientData: {
      dateOfBirth: new Date('1975-08-20'),
      gender: 'MALE' as Gender,
      bloodGroup: 'O+',
      height: 172,
      weight: 78,
      village: 'Shirur',
      taluka: 'Shirur',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '412210',
      emergencyName: 'Sunita Patil',
      emergencyPhone: '9876543221',
      emergencyRelation: 'Wife',
      allergies: [],
      chronicConditions: ['Hypertension', 'Diabetes Type 2'],
      currentMedications: ['Metformin 500mg', 'Amlodipine 5mg'],
    },
  },
  {
    email: 'patient3@demo.com',
    password: 'password123',
    phone: '9876543215',
    firstName: 'Sunita',
    lastName: 'Jadhav',
    role: 'PATIENT' as UserRole,
    preferredLanguage: 'mr',
    patientData: {
      dateOfBirth: new Date('1985-03-10'),
      gender: 'FEMALE' as Gender,
      bloodGroup: 'A+',
      height: 155,
      weight: 62,
      village: 'Baramati',
      taluka: 'Baramati',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '413102',
      emergencyName: 'Vijay Jadhav',
      emergencyPhone: '9876543222',
      emergencyRelation: 'Husband',
      allergies: ['Sulfa drugs'],
      chronicConditions: [],
      currentMedications: [],
    },
  },
  {
    email: 'patient4@demo.com',
    password: 'password123',
    phone: '9876543216',
    firstName: 'Amit',
    lastName: 'Deshmukh',
    role: 'PATIENT' as UserRole,
    preferredLanguage: 'en',
    patientData: {
      dateOfBirth: new Date('1968-11-25'),
      gender: 'MALE' as Gender,
      bloodGroup: 'AB+',
      height: 168,
      weight: 85,
      village: 'Kolhapur',
      taluka: 'Karveer',
      district: 'Kolhapur',
      state: 'Maharashtra',
      pincode: '416003',
      emergencyName: 'Meera Deshmukh',
      emergencyPhone: '9876543223',
      emergencyRelation: 'Wife',
      allergies: [],
      chronicConditions: ['Coronary Artery Disease', 'High Cholesterol'],
      currentMedications: ['Aspirin 75mg', 'Atorvastatin 20mg', 'Metoprolol 25mg'],
    },
  },

  // === DOCTORS ===
  {
    email: 'doctor@demo.com',
    password: 'password123',
    phone: '9876543211',
    firstName: 'Rajesh',
    lastName: 'Kulkarni',
    role: 'DOCTOR' as UserRole,
    preferredLanguage: 'en',
    doctorData: {
      specialization: 'General Medicine',
      qualification: 'MBBS, MD (Medicine)',
      registrationNumber: 'MMC-2010-45678',
      experience: 14,
      consultationFee: 300,
      rating: 4.7,
      totalConsultations: 2150,
      isAvailable: true,
    },
  },
  {
    email: 'doctor2@demo.com',
    password: 'password123',
    phone: '9876543217',
    firstName: 'Anjali',
    lastName: 'Desai',
    role: 'DOCTOR' as UserRole,
    preferredLanguage: 'en',
    doctorData: {
      specialization: 'Gynecology & Obstetrics',
      qualification: 'MBBS, MS (OB-GYN)',
      registrationNumber: 'MMC-2008-34567',
      experience: 16,
      consultationFee: 500,
      rating: 4.9,
      totalConsultations: 3200,
      isAvailable: true,
    },
  },
  {
    email: 'doctor3@demo.com',
    password: 'password123',
    phone: '9876543218',
    firstName: 'Vikram',
    lastName: 'Joshi',
    role: 'DOCTOR' as UserRole,
    preferredLanguage: 'mr',
    doctorData: {
      specialization: 'Pediatrics',
      qualification: 'MBBS, DCH, DNB (Pediatrics)',
      registrationNumber: 'MMC-2012-56789',
      experience: 12,
      consultationFee: 400,
      rating: 4.8,
      totalConsultations: 1850,
      isAvailable: true,
    },
  },
  {
    email: 'doctor4@demo.com',
    password: 'password123',
    phone: '9876543219',
    firstName: 'Meena',
    lastName: 'Sawant',
    role: 'DOCTOR' as UserRole,
    preferredLanguage: 'en',
    doctorData: {
      specialization: 'Cardiology',
      qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
      registrationNumber: 'MMC-2005-23456',
      experience: 19,
      consultationFee: 800,
      rating: 4.9,
      totalConsultations: 4500,
      isAvailable: true,
    },
  },

  // === HEALTH WORKER ===
  {
    email: 'worker@demo.com',
    password: 'password123',
    phone: '9876543212',
    firstName: 'Kavita',
    lastName: 'More',
    role: 'HEALTH_WORKER' as UserRole,
    preferredLanguage: 'mr',
  },

  // === ADMIN ===
  {
    email: 'admin@demo.com',
    password: 'password123',
    phone: '9876543213',
    firstName: 'Amit',
    lastName: 'Kumar',
    role: 'ADMIN' as UserRole,
    preferredLanguage: 'en',
  },
]

// Healthcare Facilities
const FACILITIES = [
  {
    name: 'JJ Hospital',
    type: 'GOVERNMENT_HOSPITAL' as FacilityType,
    street: 'Dr. Baba Saheb Ambedkar Rd',
    city: 'Mumbai',
    district: 'Mumbai City',
    state: 'Maharashtra',
    pincode: '400008',
    latitude: 18.9667,
    longitude: 72.8386,
    phone: '022-23735555',
    emergencyPhone: '108',
    services: ['Emergency', 'General Medicine', 'Surgery', 'Pediatrics', 'Gynecology', 'Cardiology'],
    openTime: '00:00',
    closeTime: '24:00',
    is24x7: true,
    totalBeds: 1350,
    availableBeds: 150,
  },
  {
    name: 'Sassoon General Hospital',
    type: 'GOVERNMENT_HOSPITAL' as FacilityType,
    street: 'Sassoon Road',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    latitude: 18.5230,
    longitude: 73.8804,
    phone: '020-26128000',
    emergencyPhone: '108',
    services: ['Emergency', 'General Medicine', 'Surgery', 'Orthopedics', 'ENT', 'Cardiology'],
    openTime: '00:00',
    closeTime: '24:00',
    is24x7: true,
    totalBeds: 1300,
    availableBeds: 200,
  },
  {
    name: 'Primary Health Centre Phaltan',
    type: 'PHC' as FacilityType,
    street: 'Near Bus Stand',
    city: 'Phaltan',
    district: 'Satara',
    state: 'Maharashtra',
    pincode: '415523',
    latitude: 17.9833,
    longitude: 74.4333,
    phone: '02166-220234',
    services: ['OPD', 'Vaccination', 'Antenatal Care', 'Family Planning'],
    openTime: '09:00',
    closeTime: '17:00',
    is24x7: false,
    totalBeds: 6,
    availableBeds: 4,
  },
  {
    name: 'Ruby Hall Clinic',
    type: 'PRIVATE_HOSPITAL' as FacilityType,
    street: '40, Sassoon Road',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    latitude: 18.5260,
    longitude: 73.8750,
    phone: '020-66455100',
    emergencyPhone: '020-66455200',
    services: ['Emergency', 'Cardiology', 'Oncology', 'Nephrology', 'Neurology', 'Orthopedics'],
    openTime: '00:00',
    closeTime: '24:00',
    is24x7: true,
    totalBeds: 550,
    availableBeds: 45,
  },
]

// Health Education Articles
const HEALTH_ARTICLES = [
  {
    title: 'Understanding Blood Pressure',
    titleMarathi: 'रक्तदाब समजून घेणे',
    titleHindi: 'रक्तचाप को समझना',
    content: 'Blood pressure is the force of blood pushing against blood vessel walls. It is measured in millimeters of mercury (mmHg). Normal blood pressure is below 120/80 mmHg. High blood pressure (hypertension) is a silent killer that can lead to heart disease, stroke, and kidney problems. Regular monitoring, healthy diet, exercise, and medication if prescribed are key to managing blood pressure.',
    contentMarathi: 'रक्तदाब म्हणजे रक्तवाहिन्यांच्या भिंतींवर रक्ताचा दबाव. हे मिलिमीटर पारा (mmHg) मध्ये मोजले जाते. सामान्य रक्तदाब 120/80 mmHg पेक्षा कमी असतो.',
    contentHindi: 'रक्तचाप रक्त वाहिकाओं की दीवारों पर रक्त के दबाव को कहते हैं। इसे मिलीमीटर पारा (mmHg) में मापा जाता है। सामान्य रक्तचाप 120/80 mmHg से कम होता है।',
    category: 'CHRONIC_DISEASE' as ArticleCategory,
    tags: ['blood pressure', 'hypertension', 'heart health'],
    readTimeMinutes: 5,
  },
  {
    title: 'Diabetes Prevention and Management',
    titleMarathi: 'मधुमेह प्रतिबंध आणि व्यवस्थापन',
    titleHindi: 'मधुमेह की रोकथाम और प्रबंधन',
    content: 'Diabetes is a condition where your body cannot properly use glucose for energy. Type 2 diabetes can often be prevented through lifestyle changes: maintain healthy weight, exercise regularly, eat balanced diet, and limit sugar intake. If diagnosed, follow your treatment plan, monitor blood sugar, and attend regular checkups.',
    contentMarathi: 'मधुमेह ही एक स्थिती आहे ज्यात शरीर ऊर्जेसाठी ग्लुकोज योग्यरित्या वापरू शकत नाही. टाइप 2 मधुमेह अनेकदा जीवनशैलीतील बदलांद्वारे टाळता येतो.',
    contentHindi: 'मधुमेह एक ऐसी स्थिति है जहां शरीर ऊर्जा के लिए ग्लूकोज का ठीक से उपयोग नहीं कर पाता। टाइप 2 मधुमेह को अक्सर जीवनशैली में बदलाव से रोका जा सकता है।',
    category: 'CHRONIC_DISEASE' as ArticleCategory,
    tags: ['diabetes', 'blood sugar', 'lifestyle'],
    readTimeMinutes: 7,
  },
  {
    title: 'Safe Pregnancy Tips',
    titleMarathi: 'सुरक्षित गर्भधारणा टिप्स',
    titleHindi: 'सुरक्षित गर्भावस्था युक्तियाँ',
    content: 'Regular antenatal checkups are essential for a healthy pregnancy. Visit your doctor monthly in the first two trimesters, then bi-weekly, and weekly in the final month. Take iron and folic acid supplements, eat nutritious food, stay hydrated, and get adequate rest.',
    contentMarathi: 'निरोगी गर्भधारणेसाठी नियमित प्रसूतीपूर्व तपासणी आवश्यक आहे.',
    contentHindi: 'स्वस्थ गर्भावस्था के लिए नियमित प्रसवपूर्व जांच आवश्यक है।',
    category: 'MATERNAL_HEALTH' as ArticleCategory,
    tags: ['pregnancy', 'antenatal care', 'maternal health'],
    readTimeMinutes: 6,
  },
  {
    title: 'Child Vaccination Schedule',
    titleMarathi: 'बाल लसीकरण वेळापत्रक',
    titleHindi: 'बाल टीकाकरण अनुसूची',
    content: 'Vaccination protects children from dangerous diseases. Follow the government immunization schedule: BCG, Hepatitis B, OPV, DPT, Measles, and others at recommended ages. Vaccines are safe, effective, and free at government health centers.',
    contentMarathi: 'लसीकरण मुलांना धोकादायक आजारांपासून संरक्षण देते.',
    contentHindi: 'टीकाकरण बच्चों को खतरनाक बीमारियों से बचाता है।',
    category: 'CHILD_HEALTH' as ArticleCategory,
    tags: ['vaccination', 'immunization', 'child health'],
    readTimeMinutes: 5,
  },
]

async function main() {
  console.log('Starting database seed...')

  // Clear existing data
  console.log('Clearing existing data...')
  await prisma.notification.deleteMany()
  await prisma.medicineReminder.deleteMany()
  await prisma.aIAssessment.deleteMany()
  await prisma.healthMetric.deleteMany()
  await prisma.medicalRecord.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.consultation.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.healthArticle.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.healthWorker.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.user.deleteMany()

  // Create facilities
  console.log('Creating facilities...')
  const facilities = await Promise.all(
    FACILITIES.map(facility =>
      prisma.facility.create({
        data: facility,
      })
    )
  )
  console.log(`Created ${facilities.length} facilities`)

  // Create demo users
  console.log('Creating demo users...')
  const createdDoctors: { id: string; firstName: string; lastName: string }[] = []
  const createdPatients: { id: string; odName: string }[] = []

  for (const userData of DEMO_USERS) {
    const hashedPassword = await hashPassword(userData.password)
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        preferredLanguage: userData.preferredLanguage,
        isActive: true,
        isVerified: true,
      },
    })

    // Create role-specific profile
    if (userData.role === 'PATIENT' && 'patientData' in userData) {
      const patient = await prisma.patient.create({
        data: {
          userId: user.id,
          ...userData.patientData,
        },
      })
      createdPatients.push({ id: patient.id, odName: `${userData.firstName} ${userData.lastName}` })
    } else if (userData.role === 'DOCTOR' && 'doctorData' in userData) {
      const doctor = await prisma.doctor.create({
        data: {
          userId: user.id,
          facilityId: facilities[Math.floor(Math.random() * 2)].id, // Assign to JJ or Sassoon
          ...userData.doctorData,
        },
      })
      createdDoctors.push({ id: doctor.id, firstName: userData.firstName, lastName: userData.lastName })
    } else if (userData.role === 'HEALTH_WORKER') {
      await prisma.healthWorker.create({
        data: {
          userId: user.id,
          employeeId: 'ASHA001',
          designation: 'ASHA',
          assignedVillages: ['Phaltan', 'Nimbalak', 'Vaduj'],
          assignedTaluka: 'Phaltan',
          assignedDistrict: 'Satara',
          facilityId: facilities[2].id,
        },
      })
    }

    console.log(`Created ${userData.role}: ${userData.email} (${userData.firstName} ${userData.lastName})`)
  }

  // Create health articles
  console.log('Creating health articles...')
  await Promise.all(
    HEALTH_ARTICLES.map(article =>
      prisma.healthArticle.create({
        data: article,
      })
    )
  )
  console.log(`Created ${HEALTH_ARTICLES.length} health articles`)

  // Create sample appointments for testing video calls
  console.log('Creating sample appointments...')
  const today = new Date()
  const appointmentTimes = ['09:00', '10:30', '14:00', '15:30']
  
  for (let i = 0; i < Math.min(createdPatients.length, createdDoctors.length); i++) {
    await prisma.appointment.create({
      data: {
        patientId: createdPatients[i].id,
        doctorId: createdDoctors[i].id,
        facilityId: facilities[0].id,
        scheduledDate: today,
        scheduledTime: appointmentTimes[i],
        type: 'VIDEO' as AppointmentType,
        status: 'CONFIRMED' as AppointmentStatus,
        reason: `Routine checkup - ${createdPatients[i].odName}`,
        notes: 'Scheduled via SwasthyaSetu platform',
      },
    })
  }
  console.log(`Created ${Math.min(createdPatients.length, createdDoctors.length)} sample appointments`)

  console.log('\n' + '='.repeat(60))
  console.log('=== Seed completed successfully! ===')
  console.log('='.repeat(60))
  console.log('\n📋 Demo Credentials:')
  console.log('─'.repeat(60))
  console.log('\n👤 PATIENTS:')
  DEMO_USERS.filter(u => u.role === 'PATIENT').forEach(user => {
    console.log(`   ${user.firstName} ${user.lastName}`)
    console.log(`   Email: ${user.email} | Password: ${user.password}`)
    console.log('')
  })
  console.log('👨‍⚕️ DOCTORS:')
  DEMO_USERS.filter(u => u.role === 'DOCTOR').forEach(user => {
    const doctorData = 'doctorData' in user ? user.doctorData : null
    console.log(`   Dr. ${user.firstName} ${user.lastName} (${doctorData?.specialization})`)
    console.log(`   Email: ${user.email} | Password: ${user.password}`)
    console.log('')
  })
  console.log('🏥 HEALTH WORKER:')
  DEMO_USERS.filter(u => u.role === 'HEALTH_WORKER').forEach(user => {
    console.log(`   ${user.firstName} ${user.lastName}`)
    console.log(`   Email: ${user.email} | Password: ${user.password}`)
    console.log('')
  })
  console.log('⚙️ ADMIN:')
  DEMO_USERS.filter(u => u.role === 'ADMIN').forEach(user => {
    console.log(`   ${user.firstName} ${user.lastName}`)
    console.log(`   Email: ${user.email} | Password: ${user.password}`)
    console.log('')
  })
  console.log('─'.repeat(60))
  console.log('\n🎥 Video Call Testing:')
  console.log('   Test Patient URL: http://localhost:5173/test/patient-call/test-room')
  console.log('   Test Doctor URL:  http://localhost:5173/test/doctor-call/test-room')
  console.log('   (Open both URLs in separate browser windows/tabs)')
  console.log('─'.repeat(60))
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
