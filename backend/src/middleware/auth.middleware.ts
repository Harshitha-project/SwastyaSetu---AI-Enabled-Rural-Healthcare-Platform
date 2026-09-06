import { Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.utils'
import { sendUnauthorized } from '../utils/response.utils'
import { AuthRequest } from '../types'

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Response | void {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Access token required')
    }

    const token = authHeader.split(' ')[1]
    
    if (!token) {
      return sendUnauthorized(res, 'Access token required')
    }

    const payload = verifyAccessToken(token)
    
    if (!payload) {
      return sendUnauthorized(res, 'Invalid or expired access token')
    }

    // Attach user info to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return sendUnauthorized(res, 'Authentication failed')
  }
}

// Optional authentication - doesn't fail if no token
export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const payload = verifyAccessToken(token)
      
      if (payload) {
        req.user = {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
        }
      }
    }

    next()
  } catch {
    // Continue without authentication
    next()
  }
}
