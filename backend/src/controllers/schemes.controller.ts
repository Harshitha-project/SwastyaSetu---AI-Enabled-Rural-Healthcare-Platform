/**
 * Government Schemes & Insurance Controller
 * Handles health schemes, eligibility, insurance claims, and card verification
 */

import { Request, Response } from 'express'
import { successResponse, errorResponse } from '../utils/response.utils'

// Types
interface GovernmentScheme {
  id: string
  name: string
  nameMarathi: string
  category: string
  coverageAmount: number
  ministry: string
  helplineNumber: string
  isActive: boolean
}

interface InsuranceCard {
  id: string
  type: string
  cardNumber: string
  beneficiaryName: string
  coverageAmount: number
  usedAmount: number
  remainingAmount: number
  validFrom: string
  validUntil: string
  isActive: boolean
}

interface InsuranceClaim {
  id: string
  claimNumber: string
  insuranceType: string
  cardNumber: string
  patientName: string
  hospitalName: string
  claimAmount: number
  status: string
  createdAt: string
}

// Mock Government Schemes Data
const governmentSchemes: GovernmentScheme[] = [
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat - PMJAY',
    nameMarathi: 'आयुष्मान भारत - पीएमजेएवाय',
    category: 'NATIONAL',
    coverageAmount: 500000,
    ministry: 'Ministry of Health and Family Welfare',
    helplineNumber: '14555',
    isActive: true,
  },
  {
    id: 'mjpjay',
    name: 'Mahatma Jyotiba Phule Jan Arogya Yojana',
    nameMarathi: 'महात्मा ज्योतिबा फुले जन आरोग्य योजना',
    category: 'STATE',
    coverageAmount: 150000,
    ministry: 'Government of Maharashtra',
    helplineNumber: '155388',
    isActive: true,
  },
  {
    id: 'janani-suraksha',
    name: 'Janani Suraksha Yojana',
    nameMarathi: 'जननी सुरक्षा योजना',
    category: 'MATERNAL',
    coverageAmount: 6000,
    ministry: 'Ministry of Health and Family Welfare',
    helplineNumber: '104',
    isActive: true,
  },
  {
    id: 'pmsby',
    name: 'Pradhan Mantri Suraksha Bima Yojana',
    nameMarathi: 'प्रधानमंत्री सुरक्षा बीमा योजना',
    category: 'NATIONAL',
    coverageAmount: 200000,
    ministry: 'Ministry of Finance',
    helplineNumber: '1800-180-1111',
    isActive: true,
  },
]

// Mock Insurance Cards
const insuranceCards: InsuranceCard[] = [
  {
    id: 'card-001',
    type: 'AYUSHMAN_BHARAT',
    cardNumber: 'MH-PMJAY-123456789012',
    beneficiaryName: 'Ramesh Kumar Patil',
    coverageAmount: 500000,
    usedAmount: 45000,
    remainingAmount: 455000,
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    isActive: true,
  },
]

// Mock Claims
const insuranceClaims: InsuranceClaim[] = [
  {
    id: 'claim-001',
    claimNumber: 'CLM-PMJAY-2024-001234',
    insuranceType: 'AYUSHMAN_BHARAT',
    cardNumber: 'MH-PMJAY-123456789012',
    patientName: 'Ramesh Kumar Patil',
    hospitalName: 'District Civil Hospital, Pune',
    claimAmount: 45000,
    status: 'SETTLED',
    createdAt: '2024-05-14T09:00:00Z',
  },
]

/**
 * Get all government schemes
 */
export const getAllSchemes = async (req: Request, res: Response) => {
  try {
    const { category } = req.query
    
    let schemes = governmentSchemes.filter(s => s.isActive)
    
    if (category && category !== 'ALL') {
      schemes = schemes.filter(s => s.category === category)
    }

    return successResponse(res, schemes, 'Schemes retrieved successfully')
  } catch (error) {
    console.error('Get schemes error:', error)
    return errorResponse(res, 'Failed to retrieve schemes', 500)
  }
}

/**
 * Get scheme by ID
 */
export const getSchemeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const scheme = governmentSchemes.find(s => s.id === id)

    if (!scheme) {
      return errorResponse(res, 'Scheme not found', 404)
    }

    return successResponse(res, scheme, 'Scheme retrieved successfully')
  } catch (error) {
    console.error('Get scheme error:', error)
    return errorResponse(res, 'Failed to retrieve scheme', 500)
  }
}

/**
 * Check eligibility for a scheme
 */
export const checkEligibility = async (req: Request, res: Response) => {
  try {
    const { schemeId } = req.params
    const userProfile = req.body

    const scheme = governmentSchemes.find(s => s.id === schemeId)
    if (!scheme) {
      return errorResponse(res, 'Scheme not found', 404)
    }

    // Mock eligibility check logic
    const matchedCriteria: string[] = []
    const unmatchedCriteria: string[] = []

    // Simple eligibility rules
    if (userProfile.isBPL) {
      matchedCriteria.push('BPL status verified')
    } else if (scheme.category === 'NATIONAL') {
      unmatchedCriteria.push('BPL status required for this scheme')
    }

    if (userProfile.state === 'Maharashtra') {
      matchedCriteria.push('Maharashtra residency confirmed')
    }

    if (userProfile.age >= 18) {
      matchedCriteria.push('Age criteria met')
    }

    const totalCriteria = matchedCriteria.length + unmatchedCriteria.length
    const eligibilityScore = totalCriteria > 0 
      ? Math.round((matchedCriteria.length / totalCriteria) * 100) 
      : 100

    const result = {
      schemeId,
      isEligible: unmatchedCriteria.length === 0,
      eligibilityScore,
      matchedCriteria,
      unmatchedCriteria,
      recommendations: unmatchedCriteria.length > 0 
        ? ['Contact your local PHC or CSC center for assistance']
        : ['You can apply for this scheme online or at nearest CSC'],
    }

    return successResponse(res, result, 'Eligibility checked successfully')
  } catch (error) {
    console.error('Check eligibility error:', error)
    return errorResponse(res, 'Failed to check eligibility', 500)
  }
}

/**
 * Get user's scheme applications
 */
export const getMyApplications = async (req: Request, res: Response) => {
  try {
    // Mock applications data
    const applications = [
      {
        id: 'app-001',
        schemeId: 'ayushman-bharat',
        schemeName: 'Ayushman Bharat - PMJAY',
        status: 'ACTIVE',
        applicationNumber: 'PMJAY-MH-2024-123456',
        cardNumber: 'MH-PMJAY-123456789012',
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
      },
    ]

    return successResponse(res, applications, 'Applications retrieved successfully')
  } catch (error) {
    console.error('Get applications error:', error)
    return errorResponse(res, 'Failed to retrieve applications', 500)
  }
}

/**
 * Get user's insurance cards
 */
export const getMyInsuranceCards = async (req: Request, res: Response) => {
  try {
    return successResponse(res, insuranceCards, 'Insurance cards retrieved successfully')
  } catch (error) {
    console.error('Get insurance cards error:', error)
    return errorResponse(res, 'Failed to retrieve insurance cards', 500)
  }
}

/**
 * Verify insurance card
 */
export const verifyCard = async (req: Request, res: Response) => {
  try {
    const { cardNumber } = req.params

    const card = insuranceCards.find(c => c.cardNumber === cardNumber)

    if (!card) {
      return successResponse(res, {
        isValid: false,
        message: 'Card not found. Please check the card number.',
        messageMarathi: 'कार्ड सापडले नाही. कृपया कार्ड नंबर तपासा.',
        verifiedAt: new Date().toISOString(),
      }, 'Card verification completed')
    }

    const now = new Date()
    const validUntil = new Date(card.validUntil)

    if (validUntil < now) {
      return successResponse(res, {
        isValid: false,
        card,
        message: 'Card has expired. Please renew your card.',
        messageMarathi: 'कार्ड कालबाह्य झाले आहे. कृपया नूतनीकरण करा.',
        verifiedAt: new Date().toISOString(),
      }, 'Card verification completed')
    }

    return successResponse(res, {
      isValid: true,
      card,
      message: 'Card verified successfully. Beneficiary is eligible for cashless treatment.',
      messageMarathi: 'कार्ड यशस्वीरित्या सत्यापित झाले. लाभार्थी कॅशलेस उपचारासाठी पात्र आहे.',
      verifiedAt: new Date().toISOString(),
    }, 'Card verification completed')
  } catch (error) {
    console.error('Verify card error:', error)
    return errorResponse(res, 'Failed to verify card', 500)
  }
}

/**
 * Get user's insurance claims
 */
export const getMyClaims = async (req: Request, res: Response) => {
  try {
    return successResponse(res, insuranceClaims, 'Claims retrieved successfully')
  } catch (error) {
    console.error('Get claims error:', error)
    return errorResponse(res, 'Failed to retrieve claims', 500)
  }
}

/**
 * Get claim by ID
 */
export const getClaimById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const claim = insuranceClaims.find(c => c.id === id)

    if (!claim) {
      return errorResponse(res, 'Claim not found', 404)
    }

    return successResponse(res, claim, 'Claim retrieved successfully')
  } catch (error) {
    console.error('Get claim error:', error)
    return errorResponse(res, 'Failed to retrieve claim', 500)
  }
}

/**
 * Initiate pre-authorization request
 */
export const initiatePreAuth = async (req: Request, res: Response) => {
  try {
    const { cardNumber, hospitalId, diagnosis, estimatedAmount } = req.body

    // Mock pre-auth creation
    const newClaim: InsuranceClaim = {
      id: `claim-${Date.now()}`,
      claimNumber: `CLM-PMJAY-${Date.now()}`,
      insuranceType: 'AYUSHMAN_BHARAT',
      cardNumber,
      patientName: 'Demo Patient',
      hospitalName: 'Demo Hospital',
      claimAmount: estimatedAmount,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    }

    return successResponse(res, newClaim, 'Pre-authorization request submitted', 201)
  } catch (error) {
    console.error('Initiate pre-auth error:', error)
    return errorResponse(res, 'Failed to submit pre-authorization request', 500)
  }
}

/**
 * Get empaneled hospitals
 */
export const getEmpaneledHospitals = async (req: Request, res: Response) => {
  try {
    const { city, scheme, speciality } = req.query

    // Mock hospitals data
    const hospitals = [
      {
        id: 'hosp-001',
        name: 'District Civil Hospital',
        city: 'Pune',
        district: 'Pune',
        state: 'Maharashtra',
        phone: '020-26128000',
        hospitalType: 'GOVERNMENT',
        supportedSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY'],
        nabh: true,
        beds: 500,
        rating: 4.2,
      },
      {
        id: 'hosp-002',
        name: 'Sassoon General Hospital',
        city: 'Pune',
        district: 'Pune',
        state: 'Maharashtra',
        phone: '020-26128888',
        hospitalType: 'GOVERNMENT',
        supportedSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY', 'RSBY'],
        nabh: true,
        beds: 1200,
        rating: 4.0,
      },
      {
        id: 'hosp-003',
        name: 'Ruby Hall Clinic',
        city: 'Pune',
        district: 'Pune',
        state: 'Maharashtra',
        phone: '020-66455100',
        hospitalType: 'PRIVATE',
        supportedSchemes: ['AYUSHMAN_BHARAT', 'MJPJAY'],
        nabh: true,
        beds: 550,
        rating: 4.5,
      },
    ]

    let filteredHospitals = hospitals

    if (city) {
      filteredHospitals = filteredHospitals.filter(h => 
        h.city.toLowerCase() === (city as string).toLowerCase()
      )
    }

    if (scheme) {
      filteredHospitals = filteredHospitals.filter(h => 
        h.supportedSchemes.includes(scheme as string)
      )
    }

    return successResponse(res, filteredHospitals, 'Hospitals retrieved successfully')
  } catch (error) {
    console.error('Get hospitals error:', error)
    return errorResponse(res, 'Failed to retrieve hospitals', 500)
  }
}

/**
 * Get coverage packages
 */
export const getCoveragePackages = async (req: Request, res: Response) => {
  try {
    const { category, scheme, search } = req.query

    // Mock packages data
    const packages = [
      {
        id: 'pkg-001',
        code: 'CARD-001',
        name: 'Coronary Angiography',
        nameMarathi: 'कोरोनरी एंजियोग्राफी',
        category: 'CARDIOLOGY',
        packageAmount: 12000,
        preAuthRequired: true,
      },
      {
        id: 'pkg-002',
        code: 'ORTH-001',
        name: 'Total Knee Replacement',
        nameMarathi: 'संपूर्ण गुडघा बदलणे',
        category: 'ORTHOPEDICS',
        packageAmount: 80000,
        preAuthRequired: true,
      },
      {
        id: 'pkg-003',
        code: 'MAT-001',
        name: 'Normal Delivery',
        nameMarathi: 'सामान्य प्रसूती',
        category: 'MATERNITY',
        packageAmount: 9000,
        preAuthRequired: false,
      },
    ]

    let filteredPackages = packages

    if (category) {
      filteredPackages = filteredPackages.filter(p => p.category === category)
    }

    if (search) {
      const searchLower = (search as string).toLowerCase()
      filteredPackages = filteredPackages.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.code.toLowerCase().includes(searchLower)
      )
    }

    return successResponse(res, filteredPackages, 'Packages retrieved successfully')
  } catch (error) {
    console.error('Get packages error:', error)
    return errorResponse(res, 'Failed to retrieve packages', 500)
  }
}
