import { Request, Response } from 'express'
import { prisma } from '../config/database'
import { generateTokens, verifyRefreshToken } from '../utils/jwt.utils'
import { hashPassword, comparePassword } from '../utils/password.utils'
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendUnauthorized,
  sendServerError,
} from '../utils/response.utils'
import { AuthRequest, JwtPayload } from '../types'
import { env } from '../config/env'
import { UserRole } from '@prisma/client'

// Register new user
export async function register(req: Request, res: Response): Promise<Response> {
  try {
    const { email, password, phone, firstName, lastName, role, preferredLanguage } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone },
        ],
      },
    })

    if (existingUser) {
      return sendError(res, 'User with this email or phone already exists', 409)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with transaction for profile creation
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          phone,
          firstName,
          lastName,
          role: role as UserRole,
          preferredLanguage: preferredLanguage || 'en',
          isActive: true,
          isVerified: false,
        },
      })

      // Create role-specific profile with default values
      if (role === 'PATIENT') {
        await tx.patient.create({
          data: {
            userId: newUser.id,
            dateOfBirth: new Date('1990-01-01'),
            gender: 'OTHER',
            village: 'Not specified',
            taluka: 'Not specified',
            district: 'Not specified',
            state: 'Maharashtra',
            pincode: '000000',
            emergencyName: 'Not specified',
            emergencyPhone: phone,
            emergencyRelation: 'Self',
          },
        })
      } else if (role === 'DOCTOR') {
        await tx.doctor.create({
          data: {
            userId: newUser.id,
            specialization: 'General Physician',
            qualification: 'MBBS',
            registrationNumber: `REG${Date.now()}`,
            experience: 0,
          },
        })
      } else if (role === 'HEALTH_WORKER') {
        await tx.healthWorker.create({
          data: {
            userId: newUser.id,
            employeeId: `EMP${Date.now()}`,
            designation: 'ASHA',
            assignedVillages: [],
            assignedTaluka: 'Not specified',
            assignedDistrict: 'Not specified',
          },
        })
      }

      return newUser
    })

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const tokens = generateTokens(payload)

    // Save refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    })

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Return user without password
    const { password: _, refreshToken: __, ...userWithoutPassword } = user

    return sendCreated(res, {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
    }, 'User registered successfully')
  } catch (error) {
    console.error('Registration error:', error)
    return sendServerError(res, error as Error)
  }
}

// Login user
export async function login(req: Request, res: Response): Promise<Response> {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return sendUnauthorized(res, 'Invalid email or password')
    }

    // Check if user is active
    if (!user.isActive) {
      return sendUnauthorized(res, 'Account is deactivated. Please contact support.')
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      return sendUnauthorized(res, 'Invalid email or password')
    }

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const tokens = generateTokens(payload)

    // Save refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    })

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Return user without password
    const { password: _, refreshToken: __, ...userWithoutPassword } = user

    return sendSuccess(res, {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
    }, 'Login successful')
  } catch (error) {
    console.error('Login error:', error)
    return sendServerError(res, error as Error)
  }
}

// Logout user
export async function logout(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (req.user) {
      // Clear refresh token from database
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { refreshToken: null },
      })
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken')

    return sendSuccess(res, null, 'Logged out successfully')
  } catch (error) {
    console.error('Logout error:', error)
    return sendServerError(res, error as Error)
  }
}

// Refresh access token
export async function refreshToken(req: Request, res: Response): Promise<Response> {
  try {
    // Get refresh token from cookie or body
    const token = req.cookies?.refreshToken || req.body?.refreshToken

    if (!token) {
      return sendUnauthorized(res, 'Refresh token required')
    }

    // Verify refresh token
    const payload = verifyRefreshToken(token)

    if (!payload) {
      return sendUnauthorized(res, 'Invalid or expired refresh token')
    }

    // Find user and verify refresh token matches
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user || user.refreshToken !== token) {
      return sendUnauthorized(res, 'Invalid refresh token')
    }

    // Generate new tokens
    const newPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const tokens = generateTokens(newPayload)

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    })

    // Set new refresh token in cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    // Return user without password
    const { password: _, refreshToken: __, ...userWithoutPassword } = user

    return sendSuccess(res, {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
    }, 'Token refreshed successfully')
  } catch (error) {
    console.error('Refresh token error:', error)
    return sendServerError(res, error as Error)
  }
}

// Get current user
export async function getMe(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Not authenticated')
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        patient: true,
        doctor: true,
        healthWorker: true,
      },
    })

    if (!user) {
      return sendUnauthorized(res, 'User not found')
    }

    // Return user without sensitive fields
    const { password: _, refreshToken: __, ...userWithoutPassword } = user

    return sendSuccess(res, { user: userWithoutPassword })
  } catch (error) {
    console.error('Get me error:', error)
    return sendServerError(res, error as Error)
  }
}

// Change password
export async function changePassword(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return sendUnauthorized(res, 'Not authenticated')
    }

    const { currentPassword, newPassword } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    })

    if (!user) {
      return sendUnauthorized(res, 'User not found')
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password)

    if (!isValidPassword) {
      return sendError(res, 'Current password is incorrect', 400)
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return sendSuccess(res, null, 'Password changed successfully')
  } catch (error) {
    console.error('Change password error:', error)
    return sendServerError(res, error as Error)
  }
}
