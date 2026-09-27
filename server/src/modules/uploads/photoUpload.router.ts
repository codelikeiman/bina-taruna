import { Router } from 'express'
import { requireAdmin } from '../../middleware/requireAdmin'
import { asyncHandler } from '../../middleware/asyncHandler'
import { photoUpload, validateAndSavePhoto } from './photoUpload'
import { badRequest } from '../../utils/httpError'

/**
 * POST /api/admin/uploads/photo
 *
 * Endpoint unggah foto generik untuk konten publik (dipakai pertama kali
 * oleh field "photo_url" di resource achievements — lihat
 * src/resources/registry.ts). Mengembalikan { url } yang lalu dikirim
 * sebagai bagian body JSON biasa ke endpoint CRUD resource terkait
 * (POST/PUT /api/admin/:resource), bukan menyimpan foto atas nama resource
 * tertentu — ini menjaga endpoint upload tetap sederhana dan bisa dipakai
 * ulang oleh field foto lain di masa depan.
 */
export const photoUploadAdminRouter = Router()
photoUploadAdminRouter.use(requireAdmin)

photoUploadAdminRouter.post(
  '/uploads/photo',
  (req, res, next) => {
    photoUpload(req, res, (err) => {
      if (err) return next(badRequest(err.message || 'Gagal mengunggah berkas.'))
      next()
    })
  },
  asyncHandler(async (req, res) => {
    const saved = await validateAndSavePhoto(req.file)
    res.status(201).json(saved)
  }),
)
