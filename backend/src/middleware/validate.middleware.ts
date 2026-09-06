import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { sendValidationError } from '../utils/response.utils'

type ValidationTarget = 'body' | 'query' | 'params'

// Validate request data against a Zod schema
export function validate(
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      const data = req[target]
      const validatedData = schema.parse(data)
      
      // Replace request data with validated/transformed data
      req[target] = validatedData
      
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        
        return sendValidationError(res, formattedErrors)
      }
      
      return sendValidationError(res, [{ field: 'unknown', message: 'Validation failed' }])
    }
  }
}

// Validate request body
export function validateBody(schema: ZodSchema) {
  return validate(schema, 'body')
}

// Validate query parameters
export function validateQuery(schema: ZodSchema) {
  return validate(schema, 'query')
}

// Validate URL parameters
export function validateParams(schema: ZodSchema) {
  return validate(schema, 'params')
}

// Validate multiple targets
export function validateAll(schemas: {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const errors: Array<{ field: string; message: string }> = []

      if (schemas.body) {
        try {
          req.body = schemas.body.parse(req.body)
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map((err) => ({
                field: `body.${err.path.join('.')}`,
                message: err.message,
              }))
            )
          }
        }
      }

      if (schemas.query) {
        try {
          req.query = schemas.query.parse(req.query)
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map((err) => ({
                field: `query.${err.path.join('.')}`,
                message: err.message,
              }))
            )
          }
        }
      }

      if (schemas.params) {
        try {
          req.params = schemas.params.parse(req.params)
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map((err) => ({
                field: `params.${err.path.join('.')}`,
                message: err.message,
              }))
            )
          }
        }
      }

      if (errors.length > 0) {
        return sendValidationError(res, errors)
      }

      next()
    } catch (error) {
      return sendValidationError(res, [{ field: 'unknown', message: 'Validation failed' }])
    }
  }
}
