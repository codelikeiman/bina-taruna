import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireUser } from '../../middleware/requireUser'
import { userRegisterRateLimiter, userLoginRateLimiter, verifyCodeRateLimiter } from '../../middleware/rateLimiters'
import * as usersService from './users.service'
import { loginSchema, registerSchema, verifyCodeSchema } from './users.validation'

export const usersPublicRouter = Router()

/** POST /api/users/register — daftar akun baru. Status awal: menunggu persetujuan admin. */
usersPublicRouter.post(
  '/users/register',
  userRegisterRateLimiter,
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body)
    const user = await usersService.registerUser(input)
    res.status(201).json({
      message: 'Pendaftaran berhasil. Akun Anda menunggu persetujuan admin sebelum kode verifikasi dikirim ke email Anda.',
      user,
    })
  }),
)

/** POST /api/users/verify — submit kode 6-digit yang dikirim admin lewat email. */
usersPublicRouter.post(
  '/users/verify',
  verifyCodeRateLimiter,
  asyncHandler(async (req, res) => {
    const input = verifyCodeSchema.parse(req.body)
    await usersService.verifyUserCode(input.email, input.code)
    res.json({ message: 'Akun berhasil diverifikasi. Silakan login untuk melanjutkan pendaftaran PPDB.' })
  }),
)

/** POST /api/users/login — login akun terverifikasi. */
usersPublicRouter.post(
  '/users/login',
  userLoginRateLimiter,
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body)
    const result = await usersService.loginUser(input)
    res.json(result)
  }),
)

/** GET /api/users/me — data akun yang sedang login (dipakai frontend untuk cek sesi). */
usersPublicRouter.get(
  '/users/me',
  requireUser,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user })
  }),
)
