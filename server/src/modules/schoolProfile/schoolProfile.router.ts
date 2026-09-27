import { Router } from 'express'
import { z } from 'zod'
import * as service from './schoolProfile.service'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAdmin } from '../../middleware/requireAdmin'

const profileSchema = z.object({
  name: z.string().trim().min(1).max(150),
  short_name: z.string().trim().min(1).max(150),
  full_legal_name: z.string().trim().min(1).max(200),
  tagline: z.string().trim().min(1).max(200),
  motto: z.string().trim().min(1).max(400),
  founded_year: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
  accreditation: z.string().trim().min(1).max(50),
  npsn: z.string().trim().min(1).max(30),
  email: z.string().trim().email().max(190),
  phone: z.string().trim().min(1).max(50),
  whatsapp: z.string().trim().min(1).max(50),
  address_street: z.string().trim().min(1).max(200),
  address_area: z.string().trim().min(1).max(200),
  address_city: z.string().trim().min(1).max(200),
  instagram: z.string().trim().max(100).optional().default(''),
  youtube: z.string().trim().max(150).optional().default(''),
  facebook: z.string().trim().max(150).optional().default(''),
})

/** GET publik (dipakai situs company profile) + PUT khusus admin, dua router terpisah agar bisa dipasang di prefix berbeda. */
export const schoolProfilePublicRouter = Router()
export const schoolProfileAdminRouter = Router()

schoolProfilePublicRouter.get(
  '/school-profile',
  asyncHandler(async (_req, res) => {
    const profile = await service.getSchoolProfile()
    res.json({ item: profile })
  }),
)

schoolProfileAdminRouter.use(requireAdmin)

schoolProfileAdminRouter.get(
  '/school-profile',
  asyncHandler(async (_req, res) => {
    const profile = await service.getSchoolProfile()
    res.json({ item: profile })
  }),
)

schoolProfileAdminRouter.put(
  '/school-profile',
  asyncHandler(async (req, res) => {
    const input = profileSchema.parse(req.body)
    const profile = await service.updateSchoolProfile(input)
    res.json({ item: profile })
  }),
)
