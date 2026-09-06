/**
 * Government Schemes & Insurance Routes
 * API endpoints for health schemes, eligibility checking, insurance claims, and card verification
 */

import { Router } from 'express'
import {
  getAllSchemes,
  getSchemeById,
  checkEligibility,
  getMyApplications,
  getMyInsuranceCards,
  verifyCard,
  getMyClaims,
  getClaimById,
  initiatePreAuth,
  getEmpaneledHospitals,
  getCoveragePackages,
} from '../controllers/schemes.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

// ============ Government Schemes ============

/**
 * @route   GET /api/schemes
 * @desc    Get all government health schemes
 * @access  Public
 */
router.get('/', getAllSchemes)

/**
 * @route   GET /api/schemes/:id
 * @desc    Get scheme by ID
 * @access  Public
 */
router.get('/:id', getSchemeById)

/**
 * @route   POST /api/schemes/:schemeId/eligibility
 * @desc    Check eligibility for a scheme
 * @access  Public (user profile sent in body)
 */
router.post('/:schemeId/eligibility', checkEligibility)

/**
 * @route   GET /api/schemes/applications/me
 * @desc    Get user's scheme applications
 * @access  Private
 */
router.get('/applications/me', authenticate, getMyApplications)

// ============ Insurance Cards ============

/**
 * @route   GET /api/schemes/insurance/cards
 * @desc    Get user's insurance cards
 * @access  Private
 */
router.get('/insurance/cards', authenticate, getMyInsuranceCards)

/**
 * @route   GET /api/schemes/insurance/verify/:cardNumber
 * @desc    Verify insurance card
 * @access  Public (for hospital verification)
 */
router.get('/insurance/verify/:cardNumber', verifyCard)

// ============ Insurance Claims ============

/**
 * @route   GET /api/schemes/insurance/claims
 * @desc    Get user's insurance claims
 * @access  Private
 */
router.get('/insurance/claims', authenticate, getMyClaims)

/**
 * @route   GET /api/schemes/insurance/claims/:id
 * @desc    Get claim by ID
 * @access  Private
 */
router.get('/insurance/claims/:id', authenticate, getClaimById)

/**
 * @route   POST /api/schemes/insurance/preauth
 * @desc    Initiate pre-authorization request
 * @access  Private
 */
router.post('/insurance/preauth', authenticate, initiatePreAuth)

// ============ Empaneled Hospitals ============

/**
 * @route   GET /api/schemes/hospitals
 * @desc    Get empaneled hospitals
 * @access  Public
 */
router.get('/hospitals', getEmpaneledHospitals)

// ============ Coverage Packages ============

/**
 * @route   GET /api/schemes/packages
 * @desc    Get coverage packages
 * @access  Public
 */
router.get('/packages', getCoveragePackages)

export default router
