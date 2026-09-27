import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env'
import { generalRateLimiter } from './middleware/rateLimiters'
import { errorHandler } from './middleware/errorHandler'
import { authRouter } from './modules/auth/auth.router'
import { adminCrudRouter, publicCrudRouter } from './crud/router'
import {
  schoolProfileAdminRouter,
  schoolProfilePublicRouter,
} from './modules/schoolProfile/schoolProfile.router'
import {
  visionMissionAdminRouter,
  visionMissionPublicRouter,
} from './modules/visionMission/visionMission.router'
import { contactAdminRouter, contactPublicRouter } from './modules/contactMessages/contactMessages.router'
import { publicSiteRouter } from './modules/publicSite/publicSite.router'
import { ppdbPublicRouter } from './modules/ppdb/ppdb.public.router'
import { ppdbAdminRouter } from './modules/ppdb/ppdb.admin.router'
import { usersPublicRouter } from './modules/users/users.router'
import { usersAdminRouter } from './modules/users/users.admin.router'
import { photoUploadAdminRouter } from './modules/uploads/photoUpload.router'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(helmet())
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))
  app.use(generalRateLimiter)

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // ---- Publik: dibaca oleh situs company profile, tanpa login -----------
  // (Foto konten publik & dokumen PPDB kini disajikan langsung dari
  // Supabase Storage — lihat modules/uploads/photoUpload.ts dan
  // modules/ppdb/ppdb.documents.ts — jadi tidak ada lagi express.static
  // di sini. Ini juga yang membuat server ini bisa jalan sebagai
  // serverless function di Vercel, karena tidak lagi bergantung pada
  // filesystem lokal yang persisten.)
  app.use('/api', publicSiteRouter)
  app.use('/api', publicCrudRouter)
  app.use('/api', schoolProfilePublicRouter)
  app.use('/api', visionMissionPublicRouter)
  app.use('/api', contactPublicRouter)
  app.use('/api', ppdbPublicRouter)
  // Register/login/verify akun publik (calon siswa/orang tua) — requireUser
  // di dalamnya sendiri menjaga rute /api/users/me.
  app.use('/api', usersPublicRouter)

  // ---- Autentikasi --------------------------------------------------------
  app.use('/api/auth', authRouter)

  // ---- Admin: butuh login (lihat requireAdmin di masing-masing router) --
  app.use('/api/admin', adminCrudRouter)
  app.use('/api/admin', schoolProfileAdminRouter)
  app.use('/api/admin', visionMissionAdminRouter)
  app.use('/api/admin', contactAdminRouter)
  app.use('/api/admin', ppdbAdminRouter)
  app.use('/api/admin', usersAdminRouter)
  app.use('/api/admin', photoUploadAdminRouter)

  app.use((req, res) => {
    res.status(404).json({ error: `Rute ${req.method} ${req.path} tidak ditemukan.` })
  })

  app.use(errorHandler)

  return app
}
