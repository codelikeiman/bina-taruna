import type { NextFunction, Request, RequestHandler, Response } from 'express'

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

/**
 * Express tidak otomatis meneruskan rejected Promise ke error middleware.
 * Semua route async di proyek ini dibungkus lewat helper ini supaya error
 * (termasuk error database) selalu ditangani terpusat oleh errorHandler.ts,
 * bukan membuat proses Node crash atau request menggantung.
 */
export function asyncHandler(handler: AsyncRouteHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next)
  }
}
