import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'
import { sendError, sendServerError } from '../utils/response.utils'

// Custom API Error class
export class ApiError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

// Not found error
export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404)
  }
}

// Unauthorized error
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401)
  }
}

// Forbidden error
export class ForbiddenError extends ApiError {
  constructor(message = 'Access denied') {
    super(message, 403)
  }
}

// Validation error
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed') {
    super(message, 400)
  }
}

// 404 handler for undefined routes
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  return sendError(res, `Route ${req.originalUrl} not found`, 404)
}

// Global error handler
export function errorHandler(
  error: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  // Log error
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: env.isDevelopment ? error.stack : undefined,
  })

  // Handle API errors
  if (error instanceof ApiError) {
    return sendError(res, error.message, error.statusCode)
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    return sendError(res, error.message, 400)
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400)
  }

  // Handle Mongoose duplicate key errors
  if ((error as NodeJS.ErrnoException).code === 'E11000' || error.message?.includes('E11000')) {
    return sendError(res, 'Duplicate entry. This record already exists.', 409)
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401)
  }

  if (error.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401)
  }

  // Handle other errors
  return sendServerError(res, error)
}

// Async handler wrapper to catch async errors
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch(next) as Promise<void>
  }
}
