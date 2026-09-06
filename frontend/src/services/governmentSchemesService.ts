/**
 * Government Health Schemes Service
 * Provides access to government health schemes, eligibility checking, and application tracking
 * Includes: Ayushman Bharat, MJPJAY, PMJAY, state schemes
 */

export type SchemeCategory = 
  | 'NATIONAL'
  | 'STATE'
  | 'MATERNAL'
  | 'CHILD'
  | 'SENIOR'
  | 'DISABILITY'
  | 'DISEASE_SPECIFIC';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'DOCUMENTS_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'EXPIRED';

export interface GovernmentScheme {
  id: string;
  name: string;
  nameMarathi: string;
  nameHindi: string;
  description: string;
  descriptionMarathi: string;
  category: SchemeCategory;
  coverageAmount: number;
  coverageAmountMax?: number;
  eligibilityCriteria: EligibilityCriteria;
  benefits: string[];
  benefitsMarathi: string[];
  documents: RequiredDocument[];
  applicationUrl?: string;
  helplineNumber: string;
  isActive: boolean;
  launchDate: string;
  ministry: string;
  logo?: string;
}

export interface EligibilityCriteria {
  maxAnnualIncome?: number;
  minAge?: number;
  maxAge?: number;
  gender?: 'MALE' | 'FEMALE' | 'ALL';
  rationCardTypes?: string[];
  categories?: string[];
  conditions?: string[];
  residencyRequired?: boolean;
  bplRequired?: boolean;
}

export interface RequiredDocument {
  name: string;
  nameMarathi: string;
  mandatory: boolean;
  description?: string;
}

export interface EligibilityCheckResult {
  schemeId: string;
  isEligible: boolean;
  eligibilityScore: number;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  recommendations: string[];
}

export interface SchemeApplication {
  id: string;
  schemeId: string;
  schemeName: string;
  userId: string;
  status: ApplicationStatus;
  applicationNumber?: string;
  submittedAt?: string;
  lastUpdatedAt: string;
  documents: UploadedDocument[];
  remarks?: string;
  beneficiaryId?: string;
  cardNumber?: string;
  validFrom?: string;
  validUntil?: string;
}

export interface UploadedDocument {
  id: string;
  documentType: string;
  fileName: string;
  uploadedAt: string;
  verified: boolean;
}

export interface UserProfile {
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  annualIncome: number;
  rationCardType?: string;
  category?: string;
  state: string;
  district: string;
  isBPL: boolean;
  hasDisability?: boolean;
  disabilityType?: string;
}

// Government Health Schemes Data
const governmentSchemes: GovernmentScheme[] = [
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat - PMJAY',
    nameMarathi: 'आयुष्मान भारत - पीएमजेएवाय',
    nameHindi: 'आयुष्मान भारत - पीएमजेएवाई',
    description: 'World\'s largest government-funded health insurance scheme providing coverage up to Rs. 5 lakh per family per year for secondary and tertiary care hospitalization.',
    descriptionMarathi: 'जगातील सर्वात मोठी सरकार-पुरस्कृत आरोग्य विमा योजना जी दुय्यम आणि तृतीयक काळजी हॉस्पिटलायझेशनसाठी प्रति कुटुंब प्रति वर्ष रु. 5 लाख पर्यंत कव्हरेज प्रदान करते.',
    category: 'NATIONAL',
    coverageAmount: 500000,
    eligibilityCriteria: {
      bplRequired: true,
      categories: ['SC', 'ST', 'OBC', 'General'],
      rationCardTypes: ['BPL', 'AAY', 'Antyodaya'],
      residencyRequired: true,
    },
    benefits: [
      'Cashless treatment at empaneled hospitals',
      'No cap on family size or age',
      'Pre and post hospitalization expenses covered',
      'All pre-existing diseases covered from day one',
      'Transport allowance included',
      '1,350+ medical packages covered',
    ],
    benefitsMarathi: [
      'नोंदणीकृत रुग्णालयांमध्ये कॅशलेस उपचार',
      'कुटुंबाच्या आकारावर किंवा वयावर कोणतीही मर्यादा नाही',
      'हॉस्पिटलायझेशनपूर्वी आणि नंतरचा खर्च समाविष्ट',
      'सर्व पूर्व-अस्तित्वात असलेले आजार पहिल्या दिवसापासून समाविष्ट',
      'वाहतूक भत्ता समाविष्ट',
      '1,350+ वैद्यकीय पॅकेजेस समाविष्ट',
    ],
    documents: [
      { name: 'Aadhaar Card', nameMarathi: 'आधार कार्ड', mandatory: true },
      { name: 'Ration Card (BPL/AAY)', nameMarathi: 'रेशन कार्ड (बीपीएल/एएवाय)', mandatory: true },
      { name: 'Income Certificate', nameMarathi: 'उत्पन्न प्रमाणपत्र', mandatory: false },
      { name: 'Caste Certificate (if applicable)', nameMarathi: 'जात प्रमाणपत्र (लागू असल्यास)', mandatory: false },
    ],
    applicationUrl: 'https://pmjay.gov.in',
    helplineNumber: '14555',
    isActive: true,
    launchDate: '2018-09-23',
    ministry: 'Ministry of Health and Family Welfare',
    logo: '/schemes/ayushman-bharat.png',
  },
  {
    id: 'mjpjay',
    name: 'Mahatma Jyotiba Phule Jan Arogya Yojana (MJPJAY)',
    nameMarathi: 'महात्मा ज्योतिबा फुले जन आरोग्य योजना',
    nameHindi: 'महात्मा ज्योतिबा फुले जन आरोग्य योजना',
    description: 'Maharashtra state health insurance scheme providing cashless treatment for critical illnesses and surgeries at empaneled hospitals.',
    descriptionMarathi: 'महाराष्ट्र राज्य आरोग्य विमा योजना जी नोंदणीकृत रुग्णालयांमध्ये गंभीर आजार आणि शस्त्रक्रियांसाठी कॅशलेस उपचार प्रदान करते.',
    category: 'STATE',
    coverageAmount: 150000,
    coverageAmountMax: 500000,
    eligibilityCriteria: {
      maxAnnualIncome: 100000,
      rationCardTypes: ['Yellow', 'Orange', 'BPL'],
      residencyRequired: true,
      categories: ['SC', 'ST', 'OBC', 'General'],
    },
    benefits: [
      'Coverage for 971 surgeries and 121 medical conditions',
      'Cashless treatment at 500+ hospitals',
      'Kidney transplant coverage up to Rs. 3 lakh',
      'Follow-up treatment for 10 days post-discharge',
      'Transport allowance of Rs. 150 per hospitalization',
    ],
    benefitsMarathi: [
      '971 शस्त्रक्रिया आणि 121 वैद्यकीय परिस्थितींसाठी कव्हरेज',
      '500+ रुग्णालयांमध्ये कॅशलेस उपचार',
      'मूत्रपिंड प्रत्यारोपण रु. 3 लाख पर्यंत कव्हरेज',
      'डिस्चार्जनंतर 10 दिवसांसाठी फॉलो-अप उपचार',
      'प्रति हॉस्पिटलायझेशन रु. 150 वाहतूक भत्ता',
    ],
    documents: [
      { name: 'Aadhaar Card', nameMarathi: 'आधार कार्ड', mandatory: true },
      { name: 'Yellow/Orange Ration Card', nameMarathi: 'पिवळे/नारंगी रेशन कार्ड', mandatory: true },
      { name: 'Domicile Certificate', nameMarathi: 'अधिवास प्रमाणपत्र', mandatory: true },
    ],
    applicationUrl: 'https://www.jeevandayee.gov.in',
    helplineNumber: '155388',
    isActive: true,
    launchDate: '2012-07-02',
    ministry: 'Government of Maharashtra - Health Department',
  },
  {
    id: 'janani-suraksha',
    name: 'Janani Suraksha Yojana (JSY)',
    nameMarathi: 'जननी सुरक्षा योजना',
    nameHindi: 'जननी सुरक्षा योजना',
    description: 'Safe motherhood intervention promoting institutional delivery among poor pregnant women.',
    descriptionMarathi: 'गरीब गरोदर महिलांमध्ये संस्थात्मक प्रसूतीला प्रोत्साहन देणारी सुरक्षित मातृत्व योजना.',
    category: 'MATERNAL',
    coverageAmount: 1400,
    coverageAmountMax: 6000,
    eligibilityCriteria: {
      gender: 'FEMALE',
      minAge: 19,
      bplRequired: true,
      conditions: ['Pregnant women', 'Institutional delivery'],
    },
    benefits: [
      'Cash assistance for institutional delivery',
      'Rural areas: Rs. 1,400 (mother) + Rs. 600 (ASHA)',
      'Urban areas: Rs. 1,000 (mother) + Rs. 400 (ASHA)',
      'Free delivery services at government hospitals',
      'Post-natal care support',
    ],
    benefitsMarathi: [
      'संस्थात्मक प्रसूतीसाठी रोख सहाय्य',
      'ग्रामीण भाग: रु. 1,400 (माता) + रु. 600 (आशा)',
      'शहरी भाग: रु. 1,000 (माता) + रु. 400 (आशा)',
      'सरकारी रुग्णालयांमध्ये मोफत प्रसूती सेवा',
      'प्रसूतीनंतरच्या काळजीसाठी सहाय्य',
    ],
    documents: [
      { name: 'Aadhaar Card', nameMarathi: 'आधार कार्ड', mandatory: true },
      { name: 'BPL Card', nameMarathi: 'बीपीएल कार्ड', mandatory: true },
      { name: 'Bank Account Details', nameMarathi: 'बँक खाते तपशील', mandatory: true },
      { name: 'ANC Registration Card', nameMarathi: 'एएनसी नोंदणी कार्ड', mandatory: true },
    ],
    applicationUrl: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309',
    helplineNumber: '104',
    isActive: true,
    launchDate: '2005-04-12',
    ministry: 'Ministry of Health and Family Welfare',
  },
  {
    id: 'pmsby',
    name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
    nameMarathi: 'प्रधानमंत्री सुरक्षा बीमा योजना',
    nameHindi: 'प्रधानमंत्री सुरक्षा बीमा योजना',
    description: 'Accident insurance scheme offering coverage for death or disability due to accident at an affordable premium.',
    descriptionMarathi: 'परवडणाऱ्या प्रीमियमवर अपघातामुळे मृत्यू किंवा अपंगत्वासाठी कव्हरेज देणारी अपघात विमा योजना.',
    category: 'NATIONAL',
    coverageAmount: 200000,
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 70,
      conditions: ['Must have savings bank account', 'Annual premium of Rs. 20'],
    },
    benefits: [
      'Death due to accident: Rs. 2 lakh',
      'Total permanent disability: Rs. 2 lakh',
      'Partial permanent disability: Rs. 1 lakh',
      'Annual premium only Rs. 20',
      'Auto-debit from bank account',
    ],
    benefitsMarathi: [
      'अपघातामुळे मृत्यू: रु. 2 लाख',
      'संपूर्ण कायमचे अपंगत्व: रु. 2 लाख',
      'आंशिक कायमचे अपंगत्व: रु. 1 लाख',
      'वार्षिक प्रीमियम फक्त रु. 20',
      'बँक खात्यातून ऑटो-डेबिट',
    ],
    documents: [
      { name: 'Aadhaar Card', nameMarathi: 'आधार कार्ड', mandatory: true },
      { name: 'Bank Account', nameMarathi: 'बँक खाते', mandatory: true },
    ],
    applicationUrl: 'https://www.jansuraksha.gov.in',
    helplineNumber: '1800-180-1111',
    isActive: true,
    launchDate: '2015-05-09',
    ministry: 'Ministry of Finance',
  },
  {
    id: 'pmjjby',
    name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
    nameMarathi: 'प्रधानमंत्री जीवन ज्योती बीमा योजना',
    nameHindi: 'प्रधानमंत्री जीवन ज्योति बीमा योजना',
    description: 'Life insurance scheme providing coverage for death due to any reason at affordable premium.',
    descriptionMarathi: 'परवडणाऱ्या प्रीमियमवर कोणत्याही कारणामुळे मृत्यूसाठी कव्हरेज प्रदान करणारी जीवन विमा योजना.',
    category: 'NATIONAL',
    coverageAmount: 200000,
    eligibilityCriteria: {
      minAge: 18,
      maxAge: 50,
      conditions: ['Must have savings bank account', 'Annual premium of Rs. 436'],
    },
    benefits: [
      'Death coverage: Rs. 2 lakh',
      'Coverage for death due to any reason',
      'Annual premium only Rs. 436',
      'Auto-debit from bank account',
      'Simple enrollment through bank',
    ],
    benefitsMarathi: [
      'मृत्यू कव्हरेज: रु. 2 लाख',
      'कोणत्याही कारणामुळे मृत्यूसाठी कव्हरेज',
      'वार्षिक प्रीमियम फक्त रु. 436',
      'बँक खात्यातून ऑटो-डेबिट',
      'बँकेद्वारे सोपी नोंदणी',
    ],
    documents: [
      { name: 'Aadhaar Card', nameMarathi: 'आधार कार्ड', mandatory: true },
      { name: 'Bank Account', nameMarathi: 'बँक खाते', mandatory: true },
      { name: 'Nomination Form', nameMarathi: 'नामनिर्देशन फॉर्म', mandatory: true },
    ],
    applicationUrl: 'https://www.jansuraksha.gov.in',
    helplineNumber: '1800-180-1111',
    isActive: true,
    launchDate: '2015-05-09',
    ministry: 'Ministry of Finance',
  },
  {
    id: 'rashtriya-swasthya-bima',
    name: 'Rashtriya Swasthya Bima Yojana (RSBY)',
    nameMarathi: 'राष्ट्रीय स्वास्थ्य बीमा योजना',
    nameHindi: 'राष्ट्रीय स्वास्थ्य बीमा योजना',
    description: 'Health insurance for BPL families providing cashless hospitalization coverage.',
    descriptionMarathi: 'बीपीएल कुटुंबांसाठी कॅशलेस हॉस्पिटलायझेशन कव्हरेज प्रदान करणारी आरोग्य विमा.',
    category: 'NATIONAL',
    coverageAmount: 30000,
    eligibilityCriteria: {
      bplRequired: true,
      rationCardTypes: ['BPL'],
    },
    benefits: [
      'Annual coverage of Rs. 30,000 per family',
      'Covers up to 5 family members',
      'Cashless hospitalization',
      'Transport allowance Rs. 100 per visit (max Rs. 1,000)',
      'Pre-existing diseases covered',
    ],
    benefitsMarathi: [
      'प्रति कुटुंब वार्षिक रु. 30,000 कव्हरेज',
      '5 कुटुंब सदस्यांपर्यंत कव्हर',
      'कॅशलेस हॉस्पिटलायझेशन',
      'प्रति भेट रु. 100 वाहतूक भत्ता (कमाल रु. 1,000)',
      'पूर्व-अस्तित्वात असलेले आजार समाविष्ट',
    ],
    documents: [
      { name: 'BPL Card', nameMarathi: 'बीपीएल कार्ड', mandatory: true },
      { name: 'Aadhaar Card', nameMarathi: 'आधार कार्ड', mandatory: true },
    ],
    applicationUrl: 'https://www.rsby.gov.in',
    helplineNumber: '1800-111-565',
    isActive: true,
    launchDate: '2008-04-01',
    ministry: 'Ministry of Labour and Employment',
  },
  {
    id: 'indira-gandhi-matritva',
    name: 'Indira Gandhi Matritva Sahyog Yojana (IGMSY)',
    nameMarathi: 'इंदिरा गांधी मातृत्व सहयोग योजना',
    nameHindi: 'इंदिरा गांधी मातृत्व सहयोग योजना',
    description: 'Conditional cash transfer scheme for pregnant and lactating women to improve health and nutrition.',
    descriptionMarathi: 'गरोदर आणि स्तनपान करणाऱ्या महिलांच्या आरोग्य आणि पोषण सुधारण्यासाठी सशर्त रोख हस्तांतरण योजना.',
    category: 'MATERNAL',
    coverageAmount: 5000,
    eligibilityCriteria: {
      gender: 'FEMALE',
      minAge: 19,
      conditions: ['Pregnant women', 'First two live births'],
    },
    benefits: [
      'Rs. 5,000 in three installments',
      'First: Rs. 1,000 on registration',
      'Second: Rs. 2,000 after 6 months of pregnancy',
      'Third: Rs. 2,000 after child birth registration',
      'Wage loss compensation',
    ],
    benefitsMarathi: [
      'तीन हप्त्यांमध्ये रु. 5,000',
      'पहिला: नोंदणीवर रु. 1,000',
      'दुसरा: गर्भधारणेच्या 6 महिन्यांनंतर रु. 2,000',
      'तिसरा: बाल जन्म नोंदणीनंतर रु. 2,000',
      'वेतन हानी भरपाई',
    ],
    documents: [
      { name: 'Aadhaar Card', nameMarathi: 'आधार कार्ड', mandatory: true },
      { name: 'MCP Card', nameMarathi: 'एमसीपी कार्ड', mandatory: true },
      { name: 'Bank Account', nameMarathi: 'बँक खाते', mandatory: true },
    ],
    applicationUrl: 'https://wcd.nic.in',
    helplineNumber: '181',
    isActive: true,
    launchDate: '2010-10-28',
    ministry: 'Ministry of Women and Child Development',
  },
  {
    id: 'national-health-mission',
    name: 'National Health Mission (NHM)',
    nameMarathi: 'राष्ट्रीय आरोग्य अभियान',
    nameHindi: 'राष्ट्रीय स्वास्थ्य मिशन',
    description: 'Umbrella program providing free healthcare services including maternal care, immunization, and disease control.',
    descriptionMarathi: 'मातृ काळजी, लसीकरण आणि रोग नियंत्रणासह मोफत आरोग्य सेवा प्रदान करणारा छत्री कार्यक्रम.',
    category: 'NATIONAL',
    coverageAmount: 0,
    eligibilityCriteria: {
      residencyRequired: true,
    },
    benefits: [
      'Free healthcare at government facilities',
      'Free medicines under Jan Aushadhi',
      'Free diagnostics at public hospitals',
      'Mobile Medical Units in rural areas',
      'Free ambulance service (108)',
      'ASHA worker support',
    ],
    benefitsMarathi: [
      'सरकारी सुविधांमध्ये मोफत आरोग्य सेवा',
      'जन औषधी अंतर्गत मोफत औषधे',
      'सार्वजनिक रुग्णालयांमध्ये मोफत निदान',
      'ग्रामीण भागात मोबाईल मेडिकल युनिट्स',
      'मोफत रुग्णवाहिका सेवा (108)',
      'आशा कार्यकर्ती सहाय्य',
    ],
    documents: [
      { name: 'Aadhaar Card', nameMarathi: 'आधार कार्ड', mandatory: false },
      { name: 'Any ID Proof', nameMarathi: 'कोणताही ओळख पुरावा', mandatory: true },
    ],
    applicationUrl: 'https://nhm.gov.in',
    helplineNumber: '104',
    isActive: true,
    launchDate: '2013-05-01',
    ministry: 'Ministry of Health and Family Welfare',
  },
];

// Mock user applications
const mockApplications: SchemeApplication[] = [
  {
    id: 'app-001',
    schemeId: 'ayushman-bharat',
    schemeName: 'Ayushman Bharat - PMJAY',
    userId: 'user-123',
    status: 'ACTIVE',
    applicationNumber: 'PMJAY-MH-2024-123456',
    submittedAt: '2024-01-15T10:30:00Z',
    lastUpdatedAt: '2024-02-01T14:20:00Z',
    documents: [
      { id: 'doc-1', documentType: 'Aadhaar Card', fileName: 'aadhaar.pdf', uploadedAt: '2024-01-15T10:30:00Z', verified: true },
      { id: 'doc-2', documentType: 'Ration Card', fileName: 'ration_card.pdf', uploadedAt: '2024-01-15T10:32:00Z', verified: true },
    ],
    beneficiaryId: 'PMJAY-BEN-987654321',
    cardNumber: 'MH-123456789012',
    validFrom: '2024-02-01',
    validUntil: '2025-01-31',
  },
  {
    id: 'app-002',
    schemeId: 'mjpjay',
    schemeName: 'MJPJAY',
    userId: 'user-123',
    status: 'UNDER_REVIEW',
    applicationNumber: 'MJPJAY-2024-789012',
    submittedAt: '2024-06-20T09:00:00Z',
    lastUpdatedAt: '2024-06-25T16:00:00Z',
    documents: [
      { id: 'doc-3', documentType: 'Aadhaar Card', fileName: 'aadhaar.pdf', uploadedAt: '2024-06-20T09:00:00Z', verified: true },
      { id: 'doc-4', documentType: 'Ration Card', fileName: 'orange_card.pdf', uploadedAt: '2024-06-20T09:05:00Z', verified: false },
    ],
    remarks: 'Document verification in progress',
  },
];

class GovernmentSchemesService {
  /**
   * Get all available government schemes
   */
  async getAllSchemes(): Promise<GovernmentScheme[]> {
    // Simulate API call
    await this.delay(300);
    return governmentSchemes.filter(s => s.isActive);
  }

  /**
   * Get schemes by category
   */
  async getSchemesByCategory(category: SchemeCategory): Promise<GovernmentScheme[]> {
    await this.delay(200);
    return governmentSchemes.filter(s => s.isActive && s.category === category);
  }

  /**
   * Get scheme by ID
   */
  async getSchemeById(schemeId: string): Promise<GovernmentScheme | null> {
    await this.delay(100);
    return governmentSchemes.find(s => s.id === schemeId) || null;
  }

  /**
   * Check eligibility for a specific scheme
   */
  async checkEligibility(schemeId: string, userProfile: UserProfile): Promise<EligibilityCheckResult> {
    await this.delay(500);
    
    const scheme = governmentSchemes.find(s => s.id === schemeId);
    if (!scheme) {
      throw new Error('Scheme not found');
    }

    const matchedCriteria: string[] = [];
    const unmatchedCriteria: string[] = [];
    const recommendations: string[] = [];

    const criteria = scheme.eligibilityCriteria;

    // Check age
    if (criteria.minAge && userProfile.age < criteria.minAge) {
      unmatchedCriteria.push(`Minimum age requirement: ${criteria.minAge} years`);
    } else if (criteria.maxAge && userProfile.age > criteria.maxAge) {
      unmatchedCriteria.push(`Maximum age limit: ${criteria.maxAge} years`);
    } else if (criteria.minAge || criteria.maxAge) {
      matchedCriteria.push('Age criteria met');
    }

    // Check gender
    if (criteria.gender && criteria.gender !== 'ALL' && criteria.gender !== userProfile.gender) {
      unmatchedCriteria.push(`Gender requirement: ${criteria.gender}`);
    } else if (criteria.gender) {
      matchedCriteria.push('Gender criteria met');
    }

    // Check income
    if (criteria.maxAnnualIncome && userProfile.annualIncome > criteria.maxAnnualIncome) {
      unmatchedCriteria.push(`Maximum annual income: Rs. ${criteria.maxAnnualIncome.toLocaleString()}`);
      recommendations.push('Consider applying under a different income category if applicable');
    } else if (criteria.maxAnnualIncome) {
      matchedCriteria.push('Income criteria met');
    }

    // Check BPL
    if (criteria.bplRequired && !userProfile.isBPL) {
      unmatchedCriteria.push('BPL status required');
      recommendations.push('Apply for BPL certification at your local Tehsil office');
    } else if (criteria.bplRequired) {
      matchedCriteria.push('BPL status verified');
    }

    // Check ration card
    if (criteria.rationCardTypes && criteria.rationCardTypes.length > 0) {
      if (userProfile.rationCardType && criteria.rationCardTypes.includes(userProfile.rationCardType)) {
        matchedCriteria.push(`Valid ration card type: ${userProfile.rationCardType}`);
      } else {
        unmatchedCriteria.push(`Required ration card: ${criteria.rationCardTypes.join(' or ')}`);
        recommendations.push('Contact your local PDS office to update your ration card category');
      }
    }

    // Check residency
    if (criteria.residencyRequired) {
      if (userProfile.state === 'Maharashtra') {
        matchedCriteria.push('Maharashtra residency confirmed');
      } else {
        unmatchedCriteria.push('Maharashtra residency required');
      }
    }

    // Calculate eligibility score
    const totalCriteria = matchedCriteria.length + unmatchedCriteria.length;
    const eligibilityScore = totalCriteria > 0 
      ? Math.round((matchedCriteria.length / totalCriteria) * 100) 
      : 100;

    const isEligible = unmatchedCriteria.length === 0;

    if (!isEligible && recommendations.length === 0) {
      recommendations.push('Contact your local PHC or CSC center for assistance');
    }

    return {
      schemeId,
      isEligible,
      eligibilityScore,
      matchedCriteria,
      unmatchedCriteria,
      recommendations,
    };
  }

  /**
   * Check eligibility for all schemes
   */
  async checkAllEligibility(userProfile: UserProfile): Promise<EligibilityCheckResult[]> {
    const results: EligibilityCheckResult[] = [];
    
    for (const scheme of governmentSchemes.filter(s => s.isActive)) {
      const result = await this.checkEligibility(scheme.id, userProfile);
      results.push(result);
    }

    // Sort by eligibility score (highest first)
    return results.sort((a, b) => b.eligibilityScore - a.eligibilityScore);
  }

  /**
   * Get user's scheme applications
   */
  async getMyApplications(): Promise<SchemeApplication[]> {
    await this.delay(300);
    return mockApplications;
  }

  /**
   * Get application by ID
   */
  async getApplicationById(applicationId: string): Promise<SchemeApplication | null> {
    await this.delay(200);
    return mockApplications.find(a => a.id === applicationId) || null;
  }

  /**
   * Submit new scheme application
   */
  async submitApplication(schemeId: string, documents: File[]): Promise<SchemeApplication> {
    await this.delay(1000);
    
    const scheme = governmentSchemes.find(s => s.id === schemeId);
    if (!scheme) {
      throw new Error('Scheme not found');
    }

    const newApplication: SchemeApplication = {
      id: `app-${Date.now()}`,
      schemeId,
      schemeName: scheme.name,
      userId: 'user-123',
      status: 'SUBMITTED',
      applicationNumber: `${schemeId.toUpperCase()}-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      documents: documents.map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        documentType: file.name.split('.')[0],
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        verified: false,
      })),
    };

    return newApplication;
  }

  /**
   * Get scheme categories
   */
  getCategories(): { value: SchemeCategory; label: string; labelMarathi: string }[] {
    return [
      { value: 'NATIONAL', label: 'National Schemes', labelMarathi: 'राष्ट्रीय योजना' },
      { value: 'STATE', label: 'State Schemes', labelMarathi: 'राज्य योजना' },
      { value: 'MATERNAL', label: 'Maternal Health', labelMarathi: 'मातृ आरोग्य' },
      { value: 'CHILD', label: 'Child Health', labelMarathi: 'बाल आरोग्य' },
      { value: 'SENIOR', label: 'Senior Citizens', labelMarathi: 'ज्येष्ठ नागरिक' },
      { value: 'DISABILITY', label: 'Disability', labelMarathi: 'अपंगत्व' },
      { value: 'DISEASE_SPECIFIC', label: 'Disease Specific', labelMarathi: 'रोग विशिष्ट' },
    ];
  }

  /**
   * Search schemes
   */
  async searchSchemes(query: string): Promise<GovernmentScheme[]> {
    await this.delay(200);
    const lowerQuery = query.toLowerCase();
    
    return governmentSchemes.filter(scheme => 
      scheme.isActive && (
        scheme.name.toLowerCase().includes(lowerQuery) ||
        scheme.nameMarathi.includes(query) ||
        scheme.description.toLowerCase().includes(lowerQuery) ||
        scheme.benefits.some(b => b.toLowerCase().includes(lowerQuery))
      )
    );
  }

  /**
   * Get application status color
   */
  getStatusColor(status: ApplicationStatus): string {
    const colors: Record<ApplicationStatus, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      DOCUMENTS_REQUIRED: 'bg-orange-100 text-orange-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      ACTIVE: 'bg-emerald-100 text-emerald-800',
      EXPIRED: 'bg-gray-100 text-gray-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get status label
   */
  getStatusLabel(status: ApplicationStatus, isMarathi: boolean): string {
    const labels: Record<ApplicationStatus, { en: string; mr: string }> = {
      DRAFT: { en: 'Draft', mr: 'मसुदा' },
      SUBMITTED: { en: 'Submitted', mr: 'सादर केले' },
      UNDER_REVIEW: { en: 'Under Review', mr: 'पुनरावलोकनाधीन' },
      DOCUMENTS_REQUIRED: { en: 'Documents Required', mr: 'कागदपत्रे आवश्यक' },
      APPROVED: { en: 'Approved', mr: 'मंजूर' },
      REJECTED: { en: 'Rejected', mr: 'नाकारले' },
      ACTIVE: { en: 'Active', mr: 'सक्रिय' },
      EXPIRED: { en: 'Expired', mr: 'कालबाह्य' },
    };
    return isMarathi ? labels[status].mr : labels[status].en;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const governmentSchemesService = new GovernmentSchemesService();
export default governmentSchemesService;
