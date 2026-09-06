/**
 * Insurance Service
 * Manages health insurance claims, coverage information, and Ayushman Bharat card verification
 */

export type ClaimStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'DOCUMENTS_PENDING'
  | 'UNDER_REVIEW'
  | 'PRE_AUTH_APPROVED'
  | 'PRE_AUTH_REJECTED'
  | 'TREATMENT_ONGOING'
  | 'CLAIM_SUBMITTED'
  | 'CLAIM_APPROVED'
  | 'CLAIM_REJECTED'
  | 'PAYMENT_PROCESSED'
  | 'SETTLED'
  | 'APPEAL_PENDING';

export type InsuranceType =
  | 'AYUSHMAN_BHARAT'
  | 'MJPJAY'
  | 'PRIVATE'
  | 'EMPLOYER'
  | 'RSBY';

export type TreatmentCategory =
  | 'GENERAL_MEDICINE'
  | 'SURGERY'
  | 'CARDIOLOGY'
  | 'ONCOLOGY'
  | 'ORTHOPEDICS'
  | 'MATERNITY'
  | 'PEDIATRICS'
  | 'NEUROLOGY'
  | 'NEPHROLOGY'
  | 'EMERGENCY';

export interface InsuranceCard {
  id: string;
  type: InsuranceType;
  cardNumber: string;
  beneficiaryId: string;
  beneficiaryName: string;
  familyId?: string;
  policyNumber?: string;
  insurerName: string;
  coverageAmount: number;
  usedAmount: number;
  remainingAmount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  familyMembers?: FamilyMember[];
  qrCode?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  beneficiaryId: string;
  isHead: boolean;
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  insuranceType: InsuranceType;
  cardNumber: string;
  patientName: string;
  patientId: string;
  hospitalName: string;
  hospitalId: string;
  admissionDate: string;
  dischargeDate?: string;
  treatmentCategory: TreatmentCategory;
  diagnosis: string;
  diagnosisCode?: string;
  procedure?: string;
  procedureCode?: string;
  claimAmount: number;
  approvedAmount?: number;
  status: ClaimStatus;
  preAuthNumber?: string;
  preAuthDate?: string;
  documents: ClaimDocument[];
  timeline: ClaimTimeline[];
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimDocument {
  id: string;
  type: string;
  name: string;
  fileName: string;
  uploadedAt: string;
  verified: boolean;
  remarks?: string;
}

export interface ClaimTimeline {
  id: string;
  status: ClaimStatus;
  description: string;
  timestamp: string;
  updatedBy?: string;
}

export interface EmpaneledHospital {
  id: string;
  name: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string;
  hospitalType: 'GOVERNMENT' | 'PRIVATE' | 'TRUST';
  specialities: string[];
  supportedSchemes: InsuranceType[];
  nabh: boolean;
  beds: number;
  rating: number;
  distance?: number;
  coordinates?: { lat: number; lng: number };
}

export interface CoveragePackage {
  id: string;
  code: string;
  name: string;
  nameMarathi: string;
  category: TreatmentCategory;
  description: string;
  packageAmount: number;
  preAuthRequired: boolean;
  dayLimit?: number;
  eligibleSchemes: InsuranceType[];
}

export interface CardVerificationResult {
  isValid: boolean;
  card?: InsuranceCard;
  message: string;
  messageMarathi: string;
  verifiedAt: string;
}

// Mock Insurance Cards
const mockInsuranceCards: InsuranceCard[] = [
  {
    id: 'card-001',
    type: 'AYUSHMAN_BHARAT',
    cardNumber: 'MH-PMJAY-123456789012',
    beneficiaryId: 'PMJAY-BEN-987654321',
    beneficiaryName: 'Ramesh Kumar Patil',
    familyId: 'FAM-MH-2024-12345',
    insurerName: 'National Health Authority',
    coverageAmount: 500000,
    usedAmount: 45000,
    remainingAmount: 455000,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    isActive: true,
    familyMembers: [
      { id: 'fm-1', name: 'Ramesh Kumar Patil', relation: 'Self', age: 45, gender: 'MALE', beneficiaryId: 'PMJAY-BEN-987654321', isHead: true },
      { id: 'fm-2', name: 'Sunita Ramesh Patil', relation: 'Wife', age: 42, gender: 'FEMALE', beneficiaryId: 'PMJAY-BEN-987654322', isHead: false },
      { id: 'fm-3', name: 'Amit Ramesh Patil', relation: 'Son', age: 20, gender: 'MALE', beneficiaryId: 'PMJAY-BEN-987654323', isHead: false },
      { id: 'fm-4', name: 'Priya Ramesh Patil', relation: 'Daughter', age: 18, gender: 'FEMALE', beneficiaryId: 'PMJAY-BEN-987654324', isHead: false },
    ],
  },
  {
    id: 'card-002',
    type: 'MJPJAY',
    cardNumber: 'MJPJAY-MH-2024-567890',
    beneficiaryId: 'MJPJAY-BEN-456789',
    beneficiaryName: 'Ramesh Kumar Patil',
    insurerName: 'Government of Maharashtra',
    coverageAmount: 150000,
    usedAmount: 0,
    remainingAmount: 150000,
    validFrom: '2024-04-01',
    validUntil: '2025-03-31',
    isActive: true,
  },
];

// Mock Claims
const mockClaims: InsuranceClaim[] = [
  {
    id: 'claim-001',
    claimNumber: 'CLM-PMJAY-2024-001234',
    insuranceType: 'AYUSHMAN_BHARAT',
    cardNumber: 'MH-PMJAY-123456789012',
    patientName: 'Ramesh Kumar Patil',
    patientId: 'patient-123',
    hospitalName: 'District Civil Hospital, Pune',
    hospitalId: 'hosp-001',
    admissionDate: '2024-05-15',
    dischargeDate: '2024-05-20',
    treatmentCategory: 'CARDIOLOGY',
    diagnosis: 'Coronary Artery Disease',
    diagnosisCode: 'I25.1',
    procedure: 'Coronary Angioplasty with Stent',
    procedureCode: 'CARD-002',
    claimAmount: 45000,
    approvedAmount: 45000,
    status: 'SETTLED',
    preAuthNumber: 'PA-2024-001234',
    preAuthDate: '2024-05-14',
    documents: [
      { id: 'doc-1', type: 'Discharge Summary', name: 'Discharge Summary', fileName: 'discharge_summary.pdf', uploadedAt: '2024-05-20T10:00:00Z', verified: true },
      { id: 'doc-2', type: 'Investigation Reports', name: 'Lab Reports', fileName: 'lab_reports.pdf', uploadedAt: '2024-05-20T10:05:00Z', verified: true },
      { id: 'doc-3', type: 'Bill', name: 'Hospital Bill', fileName: 'hospital_bill.pdf', uploadedAt: '2024-05-20T10:10:00Z', verified: true },
    ],
    timeline: [
      { id: 'tl-1', status: 'SUBMITTED', description: 'Pre-authorization request submitted', timestamp: '2024-05-14T09:00:00Z' },
      { id: 'tl-2', status: 'PRE_AUTH_APPROVED', description: 'Pre-authorization approved for Rs. 50,000', timestamp: '2024-05-14T14:00:00Z' },
      { id: 'tl-3', status: 'TREATMENT_ONGOING', description: 'Patient admitted for treatment', timestamp: '2024-05-15T10:00:00Z' },
      { id: 'tl-4', status: 'CLAIM_SUBMITTED', description: 'Final claim submitted after discharge', timestamp: '2024-05-20T16:00:00Z' },
      { id: 'tl-5', status: 'CLAIM_APPROVED', description: 'Claim approved for Rs. 45,000', timestamp: '2024-05-25T11:00:00Z' },
      { id: 'tl-6', status: 'SETTLED', description: 'Payment transferred to hospital', timestamp: '2024-05-30T15:00:00Z' },
    ],
    createdAt: '2024-05-14T09:00:00Z',
    updatedAt: '2024-05-30T15:00:00Z',
  },
  {
    id: 'claim-002',
    claimNumber: 'CLM-PMJAY-2024-005678',
    insuranceType: 'AYUSHMAN_BHARAT',
    cardNumber: 'MH-PMJAY-123456789012',
    patientName: 'Sunita Ramesh Patil',
    patientId: 'patient-124',
    hospitalName: 'Sassoon General Hospital, Pune',
    hospitalId: 'hosp-002',
    admissionDate: '2024-08-10',
    treatmentCategory: 'GENERAL_MEDICINE',
    diagnosis: 'Acute Gastroenteritis',
    diagnosisCode: 'A09',
    claimAmount: 15000,
    status: 'TREATMENT_ONGOING',
    preAuthNumber: 'PA-2024-005678',
    preAuthDate: '2024-08-10',
    documents: [
      { id: 'doc-4', type: 'Admission Form', name: 'Admission Form', fileName: 'admission_form.pdf', uploadedAt: '2024-08-10T08:00:00Z', verified: true },
    ],
    timeline: [
      { id: 'tl-7', status: 'SUBMITTED', description: 'Pre-authorization request submitted', timestamp: '2024-08-10T07:30:00Z' },
      { id: 'tl-8', status: 'PRE_AUTH_APPROVED', description: 'Pre-authorization approved for Rs. 20,000', timestamp: '2024-08-10T08:00:00Z' },
      { id: 'tl-9', status: 'TREATMENT_ONGOING', description: 'Patient admitted for treatment', timestamp: '2024-08-10T09:00:00Z' },
    ],
    createdAt: '2024-08-10T07:30:00Z',
    updatedAt: '2024-08-10T09:00:00Z',
  },
];

// Empaneled Hospitals
const empaneledHospitals: EmpaneledHospital[] = [
  {
    id: 'hosp-001',
    name: 'District Civil Hospital',
    address: 'Sassoon Road, Near Pune Railway Station',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    phone: '020-26128000',
    hospitalType: 'GOVERNMENT',
    specialities: ['Cardiology', 'Orthopedics', 'General Medicine', 'Surgery', 'Pediatrics', 'Gynecology'],
    supportedSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY', 'RSBY'],
    nabh: true,
    beds: 500,
    rating: 4.2,
  },
  {
    id: 'hosp-002',
    name: 'Sassoon General Hospital',
    address: 'Sassoon Road',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    phone: '020-26128888',
    hospitalType: 'GOVERNMENT',
    specialities: ['Emergency', 'Trauma', 'General Medicine', 'Surgery', 'Neurology'],
    supportedSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY', 'RSBY'],
    nabh: true,
    beds: 1200,
    rating: 4.0,
  },
  {
    id: 'hosp-003',
    name: 'Ruby Hall Clinic',
    address: '40, Sassoon Road',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    phone: '020-66455100',
    hospitalType: 'PRIVATE',
    specialities: ['Cardiology', 'Oncology', 'Nephrology', 'Neurology', 'Orthopedics'],
    supportedSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY'],
    nabh: true,
    beds: 550,
    rating: 4.5,
  },
  {
    id: 'hosp-004',
    name: 'KEM Hospital',
    address: 'Sardar Moodliar Road, Rasta Peth',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '411011',
    phone: '020-66037300',
    hospitalType: 'TRUST',
    specialities: ['General Medicine', 'Surgery', 'Pediatrics', 'Orthopedics', 'ENT'],
    supportedSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY', 'RSBY'],
    nabh: true,
    beds: 400,
    rating: 4.3,
  },
];

// Coverage Packages (Sample)
const coveragePackages: CoveragePackage[] = [
  {
    id: 'pkg-001',
    code: 'CARD-001',
    name: 'Coronary Angiography',
    nameMarathi: 'कोरोनरी एंजियोग्राफी',
    category: 'CARDIOLOGY',
    description: 'Diagnostic procedure for coronary artery disease',
    packageAmount: 12000,
    preAuthRequired: true,
    eligibleSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY'],
  },
  {
    id: 'pkg-002',
    code: 'CARD-002',
    name: 'Coronary Angioplasty with Stent',
    nameMarathi: 'स्टेंटसह कोरोनरी एंजियोप्लास्टी',
    category: 'CARDIOLOGY',
    description: 'Percutaneous coronary intervention with drug-eluting stent',
    packageAmount: 50000,
    preAuthRequired: true,
    eligibleSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY'],
  },
  {
    id: 'pkg-003',
    code: 'ORTH-001',
    name: 'Total Knee Replacement',
    nameMarathi: 'संपूर्ण गुडघा बदलणे',
    category: 'ORTHOPEDICS',
    description: 'Unilateral total knee replacement surgery',
    packageAmount: 80000,
    preAuthRequired: true,
    dayLimit: 7,
    eligibleSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY'],
  },
  {
    id: 'pkg-004',
    code: 'ORTH-002',
    name: 'Total Hip Replacement',
    nameMarathi: 'संपूर्ण नितंब बदलणे',
    category: 'ORTHOPEDICS',
    description: 'Unilateral total hip replacement surgery',
    packageAmount: 75000,
    preAuthRequired: true,
    dayLimit: 7,
    eligibleSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY'],
  },
  {
    id: 'pkg-005',
    code: 'ONCO-001',
    name: 'Chemotherapy Cycle',
    nameMarathi: 'केमोथेरपी सायकल',
    category: 'ONCOLOGY',
    description: 'Single cycle of chemotherapy with supportive care',
    packageAmount: 15000,
    preAuthRequired: true,
    eligibleSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY'],
  },
  {
    id: 'pkg-006',
    code: 'MAT-001',
    name: 'Normal Delivery',
    nameMarathi: 'सामान्य प्रसूती',
    category: 'MATERNITY',
    description: 'Normal vaginal delivery with 3-day stay',
    packageAmount: 9000,
    preAuthRequired: false,
    dayLimit: 3,
    eligibleSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY', 'RSBY'],
  },
  {
    id: 'pkg-007',
    code: 'MAT-002',
    name: 'Cesarean Section',
    nameMarathi: 'सिझेरियन सेक्शन',
    category: 'MATERNITY',
    description: 'Cesarean delivery with 5-day stay',
    packageAmount: 18000,
    preAuthRequired: false,
    dayLimit: 5,
    eligibleSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY', 'RSBY'],
  },
  {
    id: 'pkg-008',
    code: 'GEN-001',
    name: 'Appendectomy',
    nameMarathi: 'अॅपेंडेक्टोमी',
    category: 'GENERAL_MEDICINE',
    description: 'Laparoscopic appendectomy',
    packageAmount: 20000,
    preAuthRequired: true,
    dayLimit: 3,
    eligibleSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY', 'RSBY'],
  },
];

class InsuranceService {
  /**
   * Get user's insurance cards
   */
  async getMyInsuranceCards(): Promise<InsuranceCard[]> {
    await this.delay(300);
    return mockInsuranceCards;
  }

  /**
   * Get insurance card by ID
   */
  async getCardById(cardId: string): Promise<InsuranceCard | null> {
    await this.delay(200);
    return mockInsuranceCards.find(c => c.id === cardId) || null;
  }

  /**
   * Verify Ayushman Bharat card
   */
  async verifyCard(cardNumber: string): Promise<CardVerificationResult> {
    await this.delay(800);
    
    const card = mockInsuranceCards.find(c => c.cardNumber === cardNumber);
    
    if (!card) {
      return {
        isValid: false,
        message: 'Card not found. Please check the card number and try again.',
        messageMarathi: 'कार्ड सापडले नाही. कृपया कार्ड नंबर तपासा आणि पुन्हा प्रयत्न करा.',
        verifiedAt: new Date().toISOString(),
      };
    }

    const now = new Date();
    const validUntil = new Date(card.validUntil);
    
    if (validUntil < now) {
      return {
        isValid: false,
        card,
        message: 'Card has expired. Please renew your card.',
        messageMarathi: 'कार्ड कालबाह्य झाले आहे. कृपया तुमचे कार्ड नूतनीकरण करा.',
        verifiedAt: new Date().toISOString(),
      };
    }

    if (!card.isActive) {
      return {
        isValid: false,
        card,
        message: 'Card is inactive. Please contact the helpline.',
        messageMarathi: 'कार्ड निष्क्रिय आहे. कृपया हेल्पलाइनशी संपर्क साधा.',
        verifiedAt: new Date().toISOString(),
      };
    }

    return {
      isValid: true,
      card,
      message: 'Card verified successfully. Beneficiary is eligible for cashless treatment.',
      messageMarathi: 'कार्ड यशस्वीरित्या सत्यापित झाले. लाभार्थी कॅशलेस उपचारासाठी पात्र आहे.',
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Get all claims
   */
  async getMyClaims(): Promise<InsuranceClaim[]> {
    await this.delay(300);
    return mockClaims.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Get claim by ID
   */
  async getClaimById(claimId: string): Promise<InsuranceClaim | null> {
    await this.delay(200);
    return mockClaims.find(c => c.id === claimId) || null;
  }

  /**
   * Get claims by status
   */
  async getClaimsByStatus(status: ClaimStatus): Promise<InsuranceClaim[]> {
    await this.delay(200);
    return mockClaims.filter(c => c.status === status);
  }

  /**
   * Get active/ongoing claims
   */
  async getActiveClaims(): Promise<InsuranceClaim[]> {
    await this.delay(200);
    const activeStatuses: ClaimStatus[] = [
      'SUBMITTED',
      'DOCUMENTS_PENDING',
      'UNDER_REVIEW',
      'PRE_AUTH_APPROVED',
      'TREATMENT_ONGOING',
      'CLAIM_SUBMITTED',
    ];
    return mockClaims.filter(c => activeStatuses.includes(c.status));
  }

  /**
   * Initiate new claim / Pre-authorization request
   */
  async initiatePreAuth(data: {
    cardNumber: string;
    hospitalId: string;
    treatmentCategory: TreatmentCategory;
    diagnosis: string;
    procedure?: string;
    estimatedAmount: number;
  }): Promise<InsuranceClaim> {
    await this.delay(1000);
    
    const card = mockInsuranceCards.find(c => c.cardNumber === data.cardNumber);
    const hospital = empaneledHospitals.find(h => h.id === data.hospitalId);
    
    if (!card || !hospital) {
      throw new Error('Invalid card or hospital');
    }

    const newClaim: InsuranceClaim = {
      id: `claim-${Date.now()}`,
      claimNumber: `CLM-${card.type}-${Date.now()}`,
      insuranceType: card.type,
      cardNumber: card.cardNumber,
      patientName: card.beneficiaryName,
      patientId: 'patient-123',
      hospitalName: hospital.name,
      hospitalId: hospital.id,
      admissionDate: new Date().toISOString().split('T')[0],
      treatmentCategory: data.treatmentCategory,
      diagnosis: data.diagnosis,
      procedure: data.procedure,
      claimAmount: data.estimatedAmount,
      status: 'SUBMITTED',
      documents: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'SUBMITTED',
          description: 'Pre-authorization request submitted',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newClaim;
  }

  /**
   * Upload claim document
   */
  async uploadDocument(claimId: string, documentType: string, file: File): Promise<ClaimDocument> {
    await this.delay(500);
    
    return {
      id: `doc-${Date.now()}`,
      type: documentType,
      name: documentType,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      verified: false,
    };
  }

  /**
   * Get empaneled hospitals
   */
  async getEmpaneledHospitals(filters?: {
    city?: string;
    scheme?: InsuranceType;
    speciality?: string;
  }): Promise<EmpaneledHospital[]> {
    await this.delay(300);
    
    let results = [...empaneledHospitals];
    
    if (filters?.city) {
      results = results.filter(h => h.city.toLowerCase() === filters.city!.toLowerCase());
    }
    
    if (filters?.scheme) {
      results = results.filter(h => h.supportedSchemes.includes(filters.scheme!));
    }
    
    if (filters?.speciality) {
      results = results.filter(h => 
        h.specialities.some(s => s.toLowerCase().includes(filters.speciality!.toLowerCase()))
      );
    }
    
    return results;
  }

  /**
   * Get coverage packages
   */
  async getCoveragePackages(filters?: {
    category?: TreatmentCategory;
    scheme?: InsuranceType;
    search?: string;
  }): Promise<CoveragePackage[]> {
    await this.delay(200);
    
    let results = [...coveragePackages];
    
    if (filters?.category) {
      results = results.filter(p => p.category === filters.category);
    }
    
    if (filters?.scheme) {
      results = results.filter(p => p.eligibleSchemes.includes(filters.scheme!));
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      results = results.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.nameMarathi.includes(filters.search!) ||
        p.code.toLowerCase().includes(search)
      );
    }
    
    return results;
  }

  /**
   * Get claim status color
   */
  getStatusColor(status: ClaimStatus): string {
    const colors: Record<ClaimStatus, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      DOCUMENTS_PENDING: 'bg-orange-100 text-orange-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      PRE_AUTH_APPROVED: 'bg-green-100 text-green-800',
      PRE_AUTH_REJECTED: 'bg-red-100 text-red-800',
      TREATMENT_ONGOING: 'bg-purple-100 text-purple-800',
      CLAIM_SUBMITTED: 'bg-blue-100 text-blue-800',
      CLAIM_APPROVED: 'bg-green-100 text-green-800',
      CLAIM_REJECTED: 'bg-red-100 text-red-800',
      PAYMENT_PROCESSED: 'bg-emerald-100 text-emerald-800',
      SETTLED: 'bg-emerald-100 text-emerald-800',
      APPEAL_PENDING: 'bg-amber-100 text-amber-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get status label
   */
  getStatusLabel(status: ClaimStatus, isMarathi: boolean): string {
    const labels: Record<ClaimStatus, { en: string; mr: string }> = {
      DRAFT: { en: 'Draft', mr: 'मसुदा' },
      SUBMITTED: { en: 'Submitted', mr: 'सादर केले' },
      DOCUMENTS_PENDING: { en: 'Documents Pending', mr: 'कागदपत्रे प्रलंबित' },
      UNDER_REVIEW: { en: 'Under Review', mr: 'पुनरावलोकनाधीन' },
      PRE_AUTH_APPROVED: { en: 'Pre-Auth Approved', mr: 'पूर्व-मंजूरी मंजूर' },
      PRE_AUTH_REJECTED: { en: 'Pre-Auth Rejected', mr: 'पूर्व-मंजूरी नाकारली' },
      TREATMENT_ONGOING: { en: 'Treatment Ongoing', mr: 'उपचार सुरू' },
      CLAIM_SUBMITTED: { en: 'Claim Submitted', mr: 'दावा सादर' },
      CLAIM_APPROVED: { en: 'Claim Approved', mr: 'दावा मंजूर' },
      CLAIM_REJECTED: { en: 'Claim Rejected', mr: 'दावा नाकारला' },
      PAYMENT_PROCESSED: { en: 'Payment Processed', mr: 'पेमेंट प्रक्रिया पूर्ण' },
      SETTLED: { en: 'Settled', mr: 'निपटारा' },
      APPEAL_PENDING: { en: 'Appeal Pending', mr: 'अपील प्रलंबित' },
    };
    return isMarathi ? labels[status].mr : labels[status].en;
  }

  /**
   * Get insurance type label
   */
  getInsuranceTypeLabel(type: InsuranceType, isMarathi: boolean): string {
    const labels: Record<InsuranceType, { en: string; mr: string }> = {
      AYUSHMAN_BHARAT: { en: 'Ayushman Bharat - PMJAY', mr: 'आयुष्मान भारत - पीएमजेएवाय' },
      MJPJAY: { en: 'MJPJAY', mr: 'महात्मा फुले जन आरोग्य योजना' },
      PRIVATE: { en: 'Private Insurance', mr: 'खाजगी विमा' },
      EMPLOYER: { en: 'Employer Insurance', mr: 'नियोक्ता विमा' },
      RSBY: { en: 'RSBY', mr: 'राष्ट्रीय स्वास्थ्य बीमा योजना' },
    };
    return isMarathi ? labels[type].mr : labels[type].en;
  }

  /**
   * Get treatment category label
   */
  getTreatmentCategoryLabel(category: TreatmentCategory, isMarathi: boolean): string {
    const labels: Record<TreatmentCategory, { en: string; mr: string }> = {
      GENERAL_MEDICINE: { en: 'General Medicine', mr: 'सामान्य औषध' },
      SURGERY: { en: 'Surgery', mr: 'शस्त्रक्रिया' },
      CARDIOLOGY: { en: 'Cardiology', mr: 'हृदयरोग' },
      ONCOLOGY: { en: 'Oncology', mr: 'कर्करोग विज्ञान' },
      ORTHOPEDICS: { en: 'Orthopedics', mr: 'अस्थिरोग' },
      MATERNITY: { en: 'Maternity', mr: 'प्रसूती' },
      PEDIATRICS: { en: 'Pediatrics', mr: 'बालरोग' },
      NEUROLOGY: { en: 'Neurology', mr: 'मज्जातंतू विज्ञान' },
      NEPHROLOGY: { en: 'Nephrology', mr: 'मूत्रपिंड विज्ञान' },
      EMERGENCY: { en: 'Emergency', mr: 'आणीबाणी' },
    };
    return isMarathi ? labels[category].mr : labels[category].en;
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Get helpline numbers
   */
  getHelplineNumbers(): { name: string; nameMarathi: string; number: string; scheme: InsuranceType[] }[] {
    return [
      { name: 'Ayushman Bharat Helpline', nameMarathi: 'आयुष्मान भारत हेल्पलाइन', number: '14555', scheme: ['AYUSHMAN_BHARAT'] },
      { name: 'MJPJAY Helpline', nameMarathi: 'महात्मा फुले योजना हेल्पलाइन', number: '155388', scheme: ['MJPJAY'] },
      { name: 'State Health Helpline', nameMarathi: 'राज्य आरोग्य हेल्पलाइन', number: '104', scheme: ['AYUSHMAN_BHARAT', 'MJPJAY', 'RSBY'] },
    ];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const insuranceService = new InsuranceService();
export default insuranceService;
