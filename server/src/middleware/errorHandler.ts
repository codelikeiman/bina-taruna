import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import multer from 'multer'
import { HttpError } from '../utils/httpError'
import { env } from '../config/env'

/** Error dari driver pg: `code` berisi SQLSTATE (mis. '23505'); `message` berisi pesan server. */
interface DbLikeError {
  code?: string
  message?: string
}

function isDbError(err: unknown): err is DbLikeError {
  return typeof err === 'object' && err !== null && 'code' in err
}

/**
 * Middleware error terpusat. Semua route dibungkus asyncHandler sehingga
 * error apa pun (validasi, database, atau tak terduga) berakhir di sini
 * dengan format respons yang konsisten: { error: string, fields?: {...} }.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {}
    for (const issue of err.issues) {
      const key = issue.path.join('.') || '_'
      if (!fields[key]) fields[key] = issue.message
    }
    return res.status(400).json({ error: 'Data yang dikirim tidak valid.', fields })
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message })
  }

  // Error dari multer (dipakai modul PPDB untuk unggahan berkas) — mis.
  // berkas melebihi batas ukuran, atau field-name yang tak dikenal. Ditangani
  // di sini (bukan try/catch lokal) supaya bentuk respons tetap konsisten
  // { error: string } seperti error lain, dan tidak membuat proses crash.
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran salah satu berkas melebihi batas maksimal yang diizinkan.'
        : 'Berkas yang diunggah tidak valid.'
    return res.status(400).json({ error: message })
  }

  if (isDbError(err)) {
    // 23505 = unique_violation (setara ER_DUP_ENTRY di MySQL).
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Data serupa sudah ada.' })
    }
    // 23503 = foreign_key_violation (setara ER_ROW_IS_REFERENCED_2). Di PostgreSQL kode ini
    // juga dipakai saat INSERT/UPDATE merujuk baris induk yang tidak ada; di kode saat ini
    // kasus itu tidak bisa terjadi (id induk selalu divalidasi lebih dulu).
    if (err.code === '23503') {
      return res.status(409).json({ error: 'Data ini masih dipakai oleh data lain dan tidak bisa dihapus.' })
    }
    console.error('Database error:', err.code, err.message)
    return res.status(500).json({ error: 'Terjadi kesalahan pada database.' })
  }

  console.error('Unexpected error:', err)
  const message =
    env.NODE_ENV === 'development' && err instanceof Error
      ? err.message
      : 'Terjadi kesalahan pada server. Silakan coba lagi.'
  return res.status(500).json({ error: message })
}
