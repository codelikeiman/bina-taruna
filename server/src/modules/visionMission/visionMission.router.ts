import { Router } from 'express'
import { z } from 'zod'
import { pool } from '../../db/pool'
import { asyncHandler } from '../../middleware/asyncHandler'
import { requireAdmin } from '../../middleware/requireAdmin'
import { notFound } from '../../utils/httpError'
import { CrudRepository } from '../../crud/crudRepository'
import { resourcesByKey } from '../../resources/registry'

const missionsResource = resourcesByKey.get('missions')!
const missionsRepo = new CrudRepository(missionsResource)

async function getVision(): Promise<string> {
  const { rows } = await pool.query('SELECT vision FROM vision_mission WHERE id = 1 LIMIT 1')
  if (!rows[0]) throw notFound('Visi belum dikonfigurasi. Jalankan "npm run db:migrate" di folder server.')
  return rows[0].vision as string
}

/**
 * Menggabungkan visi (teks tunggal) dan misi (daftar) dalam satu respons
 * supaya cocok dengan bentuk data `visionMission` yang dipakai komponen
 * VisiMisi.jsx di frontend — tanpa mengubah cara list misi disimpan
 * (tetap lewat tabel `missions` + CrudRepository yang sama dipakai resource lain).
 */
export const visionMissionPublicRouter = Router()
export const visionMissionAdminRouter = Router()

visionMissionPublicRouter.get(
  '/vision-mission',
  asyncHandler(async (_req, res) => {
    const [vision, missions] = await Promise.all([getVision(), missionsRepo.list()])
    res.json({ vision, missions })
  }),
)

visionMissionAdminRouter.use(requireAdmin)

visionMissionAdminRouter.get(
  '/vision-mission',
  asyncHandler(async (_req, res) => {
    const [vision, missions] = await Promise.all([getVision(), missionsRepo.list()])
    res.json({ vision, missions })
  }),
)

const visionSchema = z.object({ vision: z.string().trim().min(1, 'Visi wajib diisi.').max(2000) })

visionMissionAdminRouter.put(
  '/vision-mission/vision',
  asyncHandler(async (req, res) => {
    const { vision } = visionSchema.parse(req.body)
    await pool.query('UPDATE vision_mission SET vision = $1 WHERE id = 1', [vision])
    res.json({ vision })
  }),
)
