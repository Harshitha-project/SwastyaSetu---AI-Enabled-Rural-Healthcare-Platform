import { Response, NextFunction } from 'express'
import { sendForbidden, sendUnauthorized } from '../utils/response.utils'
import { AuthRequest, UserRole } from '../types'

// Check if user has required role(s)
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required')
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendForbidden(
        res,
        `Access denied. Required role: ${allowedRoles.join(' or ')}`
      )
    }

    next()
  }
}

// Check if user is the resource owner or has admin role
export function authorizeOwnerOrAdmin(
  getOwnerId: (req: AuthRequest) => string | undefined
) {
  return (req: AuthRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required')
    }

    const ownerId = getOwnerId(req)
    const isOwner = ownerId === req.user.userId
    const isAdmin = req.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return sendForbidden(res, 'Access denied. You can only access your own resources.')
    }

    next()
  }
}

// Check if user is a patient accessing their own data
export function authorizePatientSelf(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Response | void {
  if (!req.user) {
    return sendUnauthorized(res, 'Authentication required')
  }

  // Admin can access everything
  if (req.user.role === 'ADMIN') {
    return next()
  }

  // Doctors can access patient data
  if (req.user.role === 'DOCTOR') {
    return next()
  }

  // Health workers can access patient data
  if (req.user.role === 'HEALTH_WORKER') {
    return next()
  }

  // Patients can only access their own data
  if (req.user.role === 'PATIENT') {
    const patientId = req.params.id || req.params.patientId
    
    // If no patient ID in params, allow (will be filtered by controller)
    if (!patientId) {
      return next()
    }

    // Patient ID from token must match the requested resource
    // This check will be done in controller after fetching patient record
    return next()
  }

  return sendForbidden(res, 'Access denied')
}

// Check if user can access consultation
export function authorizeConsultation(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Response | void {
  if (!req.user) {
    return sendUnauthorized(res, 'Authentication required')
  }

  const allowedRoles: UserRole[] = ['PATIENT', 'DOCTOR', 'ADMIN']
  
  if (!allowedRoles.includes(req.user.role)) {
    return sendForbidden(res, 'Access denied')
  }

  next()
}

// Shorthand role checks
export const isPatient = authorize('PATIENT')
export const isDoctor = authorize('DOCTOR')
export const isHealthWorker = authorize('HEALTH_WORKER')
export const isAdmin = authorize('ADMIN')
export const isDoctorOrAdmin = authorize('DOCTOR', 'ADMIN')
export const isHealthcareStaff = authorize('DOCTOR', 'HEALTH_WORKER', 'ADMIN')
