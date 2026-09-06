import { Request, Response, NextFunction } from 'express'

/**
 * Security middleware for input sanitization and XSS prevention
 */

// Sanitize string input - remove potential XSS vectors
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str
  
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim()
}

// Recursively sanitize object
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj
  
  if (typeof obj === 'string') {
    return sanitizeString(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {}
    for (const key of Object.keys(obj)) {
      // Sanitize keys too (prevent prototype pollution)
      const sanitizedKey = sanitizeString(key)
      if (sanitizedKey !== '__proto__' && sanitizedKey !== 'constructor' && sanitizedKey !== 'prototype') {
        sanitized[sanitizedKey] = sanitizeObject(obj[key])
      }
    }
    return sanitized
  }
  
  return obj
}

// Input sanitization middleware
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body)
  }
  
  // Sanitize query params
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query)
  }
  
  // Sanitize URL params
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params)
  }
  
  next()
}

// Prevent NoSQL injection by checking for MongoDB operators
export function preventNoSQLInjection(req: Request, res: Response, next: NextFunction): Response | void {
  const checkForInjection = (obj: any, path = ''): boolean => {
    if (obj === null || obj === undefined) return false
    
    if (typeof obj === 'string') {
      // Check for MongoDB operators in strings
      if (obj.includes('$') && /\$[a-z]+/i.test(obj)) {
        return true
      }
    }
    
    if (typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        // Check for MongoDB operators as keys
        if (key.startsWith('$')) {
          return true
        }
        if (checkForInjection(obj[key], `${path}.${key}`)) {
          return true
        }
      }
    }
    
    return false
  }
  
  if (checkForInjection(req.body) || checkForInjection(req.query)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected',
    })
  }
  
  next()
}

// Security headers (additional to helmet)
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Remove X-Powered-By
  res.removeHeader('X-Powered-By')
  
  next()
}

// Request ID for logging and tracing
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`
  req.headers['x-request-id'] = id
  res.setHeader('X-Request-ID', id)
  next()
}

// Validate MongoDB ObjectId format
export function validateObjectId(paramName: string) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const id = req.params[paramName]
    
    if (id && !/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
      })
    }
    
    next()
  }
}

// Request size limit check (additional to express.json limit)
export function checkRequestSize(maxSizeKB: number = 100) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10)
    
    if (contentLength > maxSizeKB * 1024) {
      return res.status(413).json({
        success: false,
        message: 'Request body too large',
      })
    }
    
    next()
  }
}
