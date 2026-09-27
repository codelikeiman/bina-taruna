import type { Request, Response } from 'express'
import { z } from 'zod'
import type { ResourceConfig } from '../types/resource'
import { CrudRepository } from './crudRepository'
import { buildCreateSchema, buildUpdateSchema, reorderSchema } from './schemaBuilder'
import { badRequest, notFound } from '../utils/httpError'

const idParamSchema = z.object({ id: z.coerce.number().int().positive() })

/**
 * Membangun handler create/update/delete/reorder untuk satu resource.
 * Dipakai oleh crud/router.ts (rute admin, dilindungi requireAdmin) dan
 * bisa dipakai ulang untuk endpoint publik read-only bila diperlukan.
 */
export function buildCrudController(resource: ResourceConfig) {
  const repo = new CrudRepository(resource)
  const createSchema = buildCreateSchema(resource)
  const updateSchema = buildUpdateSchema(resource)

  return {
    list: async (_req: Request, res: Response) => {
      const items = await repo.list()
      res.json({ items })
    },

    create: async (req: Request, res: Response) => {
      const data = createSchema.parse(req.body)
      const item = await repo.create(data)
      res.status(201).json({ item })
    },

    update: async (req: Request, res: Response) => {
      const { id } = idParamSchema.parse(req.params)
      const data = updateSchema.parse(req.body)
      const item = await repo.update(id, data)
      if (!item) throw notFound(`${resource.label} dengan id ${id} tidak ditemukan.`)
      res.json({ item })
    },

    remove: async (req: Request, res: Response) => {
      const { id } = idParamSchema.parse(req.params)
      const removed = await repo.remove(id)
      if (!removed) throw notFound(`${resource.label} dengan id ${id} tidak ditemukan.`)
      res.status(204).send()
    },

    reorder: async (req: Request, res: Response) => {
      const { orderedIds } = reorderSchema.parse(req.body)
      if (new Set(orderedIds).size !== orderedIds.length) {
        throw badRequest('Daftar id mengandung duplikat.')
      }
      await repo.reorder(orderedIds)
      const items = await repo.list()
      res.json({ items })
    },
  }
}
