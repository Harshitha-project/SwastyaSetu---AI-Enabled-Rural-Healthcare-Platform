import rateLimit from 'express-rate-limit'
import { env } from '../config/env'

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs, // 15 minutes
  max: env.rateLimitMaxRequests, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Auth endpoints rate limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.authRateLimitMax, // 10 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
})

// AI assessment rate limiter (prevent abuse)
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 assessments per hour
  message: {
    success: false,
    message: 'AI assessment limit reached. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Registration rate limiter
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registration attempts per hour per IP
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})
