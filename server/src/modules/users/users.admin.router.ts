import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAdmin } from '../../middleware/requireAdmin'
import { badRequest } from '../../utils/httpError'
import * as usersService from './users.service'

export const usersAdminRouter = Router()

usersAdminRouter.use(requireAdmin)

const statusQuerySchema = z.object({
  status: z.enum(['pending_admin_approval', 'pending_verification', 'verified']).optional(),
})

/** GET /api/admin/users — daftar akun user, opsional ?status=pending_admin_approval dst. */
usersAdminRouter.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { status } = statusQuerySchema.parse(req.query)
    const items = await usersService.listUsers(status)
    res.json({ items })
  }),
)

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

/**
 * POST /api/admin/users/:id/approve — menyetujui akun & mengirim kode
 * verifikasi ke email user. Ini SATU-SATUNYA cara kode terkirim (lihat
 * pertanyaan desain: kode auto-generate, tapi pengiriman butuh persetujuan
 * admin secara eksplisit).
 */
usersAdminRouter.post(
  '/users/:id/approve',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params)
    try {
      await usersService.approveUserAndSendCode(id, req.admin!.id)
    } catch (err) {
      // Bedakan error pengiriman email dari error bisnis biasa (notFound/conflict
      // sudah HttpError dan akan lolos ke errorHandler apa adanya) supaya admin
      // tahu jelas ini soal SMTP, bukan soal data akun yang salah.
      if (err instanceof Error && !('status' in err)) {
        throw badRequest('Gagal mengirim email kode verifikasi. Periksa konfigurasi SMTP lalu coba lagi.')
      }
      throw err
    }
    res.json({ message: 'Akun disetujui dan kode verifikasi telah dikirim ke email pengguna.' })
  }),
)

/** POST /api/admin/users/:id/resend-code — kirim ulang kode verifikasi baru. */
usersAdminRouter.post(
  '/users/:id/resend-code',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params)
    try {
      await usersService.resendVerificationCode(id, req.admin!.id)
    } catch (err) {
      if (err instanceof Error && !('status' in err)) {
        throw badRequest('Gagal mengirim email kode verifikasi. Periksa konfigurasi SMTP lalu coba lagi.')
      }
      throw err
    }
    res.json({ message: 'Kode verifikasi baru telah dikirim ke email pengguna.' })
  }),
)
