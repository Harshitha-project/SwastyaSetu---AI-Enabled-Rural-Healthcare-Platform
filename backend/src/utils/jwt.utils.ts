import jwt, { SignOptions } from 'jsonwebtoken'
import { env } from '../config/env'
import { JwtPayload } from '../types'

// Parse expiry string to seconds for jwt sign options
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/)
  if (!match) return 900 // default 15 minutes
  
  const value = parseInt(match[1], 10)
  const unit = match[2]
  
  switch (unit) {
    case 's': return value
    case 'm': return value * 60
    case 'h': return value * 60 * 60
    case 'd': return value * 60 * 60 * 24
    default: return 900
  }
}

// Generate access token
export function generateAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: parseExpiry(env.jwtAccessExpiry),
  }
  return jwt.sign(payload as object, env.jwtAccessSecret, options)
}

// Generate refresh token
export function generateRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: parseExpiry(env.jwtRefreshExpiry),
  }
  return jwt.sign(payload as object, env.jwtRefreshSecret, options)
}

// Verify access token
export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.jwtAccessSecret) as JwtPayload
  } catch {
    return null
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload
  } catch {
    return null
  }
}

// Decode token without verification (for debugging)
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload
  } catch {
    return null
  }
}

// Generate both tokens
export function generateTokens(payload: JwtPayload): {
  accessToken: string
  refreshToken: string
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  }
}
