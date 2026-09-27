import { Router } from 'express'
import { z } from 'zod'
import * as authService from './auth.service'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAdmin } from '../../middleware/requireAdmin'
import { authRateLimiter } from '../../middleware/rateLimiters'

export const authRouter = Router()

const loginSchema = z.object({
  email: z.string().trim().email('Format email tidak valid.'),
  password: z.string().min(1, 'Password wajib diisi.'),
})

authRouter.post(
  '/login',
  authRateLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body)
    const result = await authService.login(email, password)
    res.json(result)
  }),
)

authRouter.get(
  '/me',
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json({ admin: req.admin })
  }),
)

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi.'),
  newPassword: z.string().min(8, 'Password baru minimal 8 karakter.'),
})

authRouter.post(
  '/change-password',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)
    await authService.changePassword(req.admin!.id, currentPassword, newPassword)
    res.json({ message: 'Password berhasil diubah.' })
  }),
)
