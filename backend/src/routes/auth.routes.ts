import { Router } from 'express'
import { register, login, logout, refreshToken, getMe, changePassword } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validateBody } from '../middleware/validate.middleware'
import { authLimiter, registerLimiter } from '../middleware/rateLimit.middleware'
import { registerSchema, loginSchema } from '../utils/validators'

const router = Router()

// POST /api/auth/register
router.post(
  '/register',
  registerLimiter,
  validateBody(registerSchema),
  register
)

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  login
)

// POST /api/auth/logout
router.post('/logout', authenticate, logout)

// POST /api/auth/refresh
router.post('/refresh', refreshToken)

// GET /api/auth/me
router.get('/me', authenticate, getMe)

// PUT /api/auth/change-password
router.put('/change-password', authenticate, changePassword)

export default router
