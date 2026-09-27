import { Router } from 'express'
import { resources } from '../resources/registry'
import { buildCrudController } from './crudController'
import { asyncHandler } from '../middleware/asyncHandler'
import { requireAdmin } from '../middleware/requireAdmin'

/**
 * Rute admin (dilindungi login) untuk seluruh resource di registry.ts:
 *   GET    /api/admin/:resource
 *   POST   /api/admin/:resource
 *   PUT    /api/admin/:resource/:id
 *   DELETE /api/admin/:resource/:id
 *   PUT    /api/admin/:resource/reorder
 */
export const adminCrudRouter = Router()
adminCrudRouter.use(requireAdmin)

/** Rute publik read-only, dipakai situs company profile untuk memuat konten terbaru. */
export const publicCrudRouter = Router()

for (const resource of resources) {
  const controller = buildCrudController(resource)
  const base = `/${resource.key}`

  adminCrudRouter.get(base, asyncHandler(controller.list))
  adminCrudRouter.post(base, asyncHandler(controller.create))
  adminCrudRouter.put(`${base}/reorder`, asyncHandler(controller.reorder))
  adminCrudRouter.put(`${base}/:id`, asyncHandler(controller.update))
  adminCrudRouter.delete(`${base}/:id`, asyncHandler(controller.remove))

  publicCrudRouter.get(base, asyncHandler(controller.list))
}
