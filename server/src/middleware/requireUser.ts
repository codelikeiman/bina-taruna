import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { verifyUserToken } from '../utils/jwt'
import { unauthorized } from '../utils/httpError'

/**
 * Melindungi rute yang butuh akun pengguna publik login (mis. mengirim
 * formulir PPDB). Sama polanya dengan requireAdmin.ts, tapi memakai token
 * & secret yang berbeda (lihat utils/jwt.ts) — token admin TIDAK bisa
 * dipakai di sini dan sebaliknya.
 */
export function requireUser(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(unauthorized('Silakan login terlebih dahulu.'))
  }

  const token = header.slice('Bearer '.length).trim()
  try {
    req.user = verifyUserToken(token)
    return next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(unauthorized('Sesi Anda telah berakhir. Silakan login kembali.'))
    }
    return next(unauthorized('Token tidak valid. Silakan login kembali.'))
  }
}
