import { Router } from 'express'
import { z } from 'zod'
import { pool } from '../../db/pool'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAdmin } from '../../middleware/requireAdmin'
import { contactFormRateLimiter } from '../../middleware/rateLimiters'
import { notFound } from '../../utils/httpError'

export const contactPublicRouter = Router()
export const contactAdminRouter = Router()

const submitSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi.').max(150),
  email: z.string().trim().email('Format email tidak valid.').max(190),
  message: z.string().trim().min(1, 'Pesan wajib diisi.').max(3000),
})

// Sesuai formulir kontak publik di src/components/Contact.jsx — endpoint ini
// yang perlu dihubungkan menggantikan TODO "setSent(true)" di komponen tsb.
contactPublicRouter.post(
  '/contact-messages',
  contactFormRateLimiter,
  asyncHandler(async (req, res) => {
    const data = submitSchema.parse(req.body)
    await pool.query('INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)', [
      data.name,
      data.email,
      data.message,
    ])
    res.status(201).json({ message: 'Pesan berhasil dikirim.' })
  }),
)

contactAdminRouter.use(requireAdmin)

const idParamSchema = z.object({ id: z.coerce.number().int().positive() })

contactAdminRouter.get(
  '/contact-messages',
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC',
    )
    res.json({ items: rows })
  }),
)

contactAdminRouter.put(
  '/contact-messages/:id/read',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params)
    const result = await pool.query(
      'UPDATE contact_messages SET is_read = 1 WHERE id = $1',
      [id],
    )
    if (result.rowCount === 0) throw notFound('Pesan tidak ditemukan.')
    res.json({ message: 'Pesan ditandai sudah dibaca.' })
  }),
)

contactAdminRouter.delete(
  '/contact-messages/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params)
    const result = await pool.query('DELETE FROM contact_messages WHERE id = $1', [id])
    if (result.rowCount === 0) throw notFound('Pesan tidak ditemukan.')
    res.status(204).send()
  }),
)
