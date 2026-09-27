import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAdmin } from '../../middleware/requireAdmin'
import { getPpdbSettings, updatePpdbSettings } from './ppdb.settings.service'
import {
  exportRegistrationsCsv,
  getRegistrationDetail,
  getRegistrationDocumentFile,
  listRegistrations,
  updateRegistrationStatus,
} from './ppdb.registrations.service'
import { listQuerySchema, settingsUpdateSchema, statusUpdateSchema } from './ppdb.validation'

export const ppdbAdminRouter = Router()
ppdbAdminRouter.use(requireAdmin)

const idParamSchema = z.object({ id: z.coerce.number().int().positive() })
const documentParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  documentId: z.coerce.number().int().positive(),
})

ppdbAdminRouter.get(
  '/ppdb-settings',
  asyncHandler(async (_req, res) => {
    const settings = await getPpdbSettings()
    res.json({ settings })
  }),
)

ppdbAdminRouter.put(
  '/ppdb-settings',
  asyncHandler(async (req, res) => {
    const input = settingsUpdateSchema.parse(req.body)
    const settings = await updatePpdbSettings(input)
    res.json({ settings })
  }),
)

// PENTING: rute /export harus terdaftar SEBELUM /:id — kalau tidak, Express
// akan mencocokkan "export" sebagai nilai :id (lalu gagal di idParamSchema)
// karena rute didaftar & dicocokkan berurutan dari atas ke bawah.
ppdbAdminRouter.get(
  '/ppdb-registrations/export',
  asyncHandler(async (req, res) => {
    const query = listQuerySchema.omit({ page: true, pageSize: true }).parse(req.query)
    const csv = await exportRegistrationsCsv(query)
    const filename = `ppdb-pendaftar-${new Date().toISOString().slice(0, 10)}.csv`
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(csv)
  }),
)

ppdbAdminRouter.get(
  '/ppdb-registrations',
  asyncHandler(async (req, res) => {
    const query = listQuerySchema.parse(req.query)
    const result = await listRegistrations(query)
    res.json(result)
  }),
)

ppdbAdminRouter.get(
  '/ppdb-registrations/:id',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params)
    const registration = await getRegistrationDetail(id)
    res.json({ registration })
  }),
)

ppdbAdminRouter.put(
  '/ppdb-registrations/:id/status',
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params)
    const { status, note } = statusUpdateSchema.parse(req.body)
    const registration = await updateRegistrationStatus(id, status, note, req.admin!)
    res.json({ registration })
  }),
)

ppdbAdminRouter.get(
  '/ppdb-registrations/:id/documents/:documentId',
  asyncHandler(async (req, res) => {
    const { id, documentId } = documentParamSchema.parse(req.params)
    const file = await getRegistrationDocumentFile(id, documentId)
    res.setHeader('Content-Type', file.mimeType)
    res.setHeader(
      'Content-Disposition',
      `inline; filename="dokumen"; filename*=UTF-8''${encodeURIComponent(file.originalFilename)}`,
    )
    // Dokumen berisi data pribadi calon siswa — jangan sampai tersimpan di
    // cache bersama (mis. proxy/CDN) sekalipun endpoint ini sudah dilindungi
    // requireAdmin.
    res.setHeader('Cache-Control', 'private, no-store')
    res.send(file.buffer)
  }),
)
