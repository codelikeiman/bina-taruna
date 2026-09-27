import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { verifyAdminToken } from '../utils/jwt'
import { unauthorized } from '../utils/httpError'

/**
 * Melindungi semua rute /api/admin/*. Mengharapkan header:
 *   Authorization: Bearer <token>
 * Token didapat dari POST /api/auth/login dan disimpan di localStorage
 * oleh dashboard admin (lihat admin/src/lib/api.ts).
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(unauthorized('Silakan login terlebih dahulu.'))
  }

  const token = header.slice('Bearer '.length).trim()
  try {
    req.admin = verifyAdminToken(token)
    return next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(unauthorized('Sesi Anda telah berakhir. Silakan login kembali.'))
    }
    return next(unauthorized('Token tidak valid. Silakan login kembali.'))
  }
}
