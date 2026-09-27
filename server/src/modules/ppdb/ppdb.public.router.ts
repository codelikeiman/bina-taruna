import { Router } from 'express'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireUser } from '../../middleware/requireUser'
import { ppdbSubmitRateLimiter, ppdbStatusCheckRateLimiter } from '../../middleware/rateLimiters'
import { getPpdbSettings } from './ppdb.settings.service'
import { checkRegistrationStatus, createRegistration, getMyLatestRegistration } from './ppdb.registrations.service'
import { registrationSubmitSchema, statusCheckSchema } from './ppdb.validation'
import { ppdbUpload, type UploadedFiles } from './ppdb.documents'

export const ppdbPublicRouter = Router()

/** GET /api/ppdb-settings — dibaca situs publik untuk tahu apakah form ditampilkan atau pesan "belum dibuka". */
ppdbPublicRouter.get(
  '/ppdb-settings',
  asyncHandler(async (_req, res) => {
    const settings = await getPpdbSettings()
    res.json({ settings })
  }),
)

/**
 * POST /api/ppdb-registrations — kirim formulir pendaftaran (multipart/form-data).
 * Membutuhkan akun terverifikasi (requireUser) — lihat modul users. Urutan
 * middleware sengaja: requireUser & rate limiter dulu (murah) baru multer
 * (mahal, mem-buffer isi berkas) — permintaan yang belum login/sudah kena
 * limit ditolak sebelum server repot mem-parsing body-nya.
 */
ppdbPublicRouter.post(
  '/ppdb-registrations',
  requireUser,
  ppdbSubmitRateLimiter,
  ppdbUpload,
  asyncHandler(async (req, res) => {
    const input = registrationSubmitSchema.parse(req.body)
    const files = (req.files ?? {}) as UploadedFiles
    const summary = await createRegistration(input, files, { ip: req.ip ?? null, userId: req.user!.id })
    res.status(201).json({ registration: summary })
  }),
)

/**
 * GET /api/ppdb-registrations/my-status — status pendaftaran PPDB milik
 * user yang sedang login (bila ada), dipakai frontend untuk menentukan
 * apakah menampilkan formulir atau status pendaftaran yang sudah ada.
 * Berbeda dari POST .../status-check (publik, pakai nomor+tgl lahir) —
 * endpoint ini otomatis tahu "milik siapa" dari token login.
 */
ppdbPublicRouter.get(
  '/ppdb-registrations/my-status',
  requireUser,
  asyncHandler(async (req, res) => {
    const registration = await getMyLatestRegistration(req.user!.id)
    res.json({ registration })
  }),
)

/** POST /api/ppdb-registrations/status-check — cek status pakai nomor pendaftaran + tanggal lahir (bukan GET, supaya tanggal lahir tidak tercatat di URL/log akses). */
ppdbPublicRouter.post(
  '/ppdb-registrations/status-check',
  ppdbStatusCheckRateLimiter,
  asyncHandler(async (req, res) => {
    const input = statusCheckSchema.parse(req.body)
    const result = await checkRegistrationStatus(input.registrationNumber.trim().toUpperCase(), input.birthDate)
    res.json({ result })
  }),
)
