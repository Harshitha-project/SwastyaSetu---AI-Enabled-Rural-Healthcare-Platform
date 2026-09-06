import { Response } from 'express'
import { ApiResponse, PaginatedResponse } from '../types'

// Success response
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  }
  return res.status(statusCode).json(response)
}

// Created response
export function sendCreated<T>(
  res: Response,
  data: T,
  message = 'Created successfully'
): Response {
  return sendSuccess(res, data, message, 201)
}

// Paginated response
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  },
  message?: string
): Response {
  const totalPages = Math.ceil(pagination.total / pagination.limit)
  
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages,
    },
    message,
  }
  
  // Set pagination headers for additional client convenience
  res.set('X-Total-Count', String(pagination.total))
  res.set('X-Total-Pages', String(totalPages))
  
  return res.status(200).json(response)
}

// Error response
export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  error?: string
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  }
  return res.status(statusCode).json(response)
}

// Not found response
export function sendNotFound(res: Response, resource = 'Resource'): Response {
  return sendError(res, `${resource} not found`, 404)
}

// Unauthorized response
export function sendUnauthorized(res: Response, message = 'Unauthorized'): Response {
  return sendError(res, message, 401)
}

// Forbidden response
export function sendForbidden(res: Response, message = 'Access denied'): Response {
  return sendError(res, message, 403)
}

// Validation error response
export function sendValidationError(res: Response, errors: unknown): Response {
  return sendError(res, 'Validation failed', 400, JSON.stringify(errors))
}

// Server error response
export function sendServerError(res: Response, error?: Error | string): Response {
  if (error) {
    console.error('Server error:', error)
  }
  return sendError(res, 'Internal server error', 500)
}

// Alias functions for backward compatibility
export function successResponse<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response {
  return sendSuccess(res, data, message, statusCode)
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = 400
): Response {
  return sendError(res, message, statusCode)
}
