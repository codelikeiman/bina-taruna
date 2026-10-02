import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { Request, Response, NextFunction } from 'express'

/**
 * PENTING -- kenapa pakai @upstash/ratelimit, bukan express-rate-limit:
 *
 * express-rate-limit (MemoryStore default) menyimpan counter-nya di memory
 * proses Node. Di Vercel serverless, tiap cold-start instance punya memory
 * terpisah -- jadi counter TIDAK ter-share antar instance. Di bawah beban
 * request concurrent, Vercel bisa spin up beberapa instance sekaligus,
 * masing-masing mulai dari counter 0, sehingga limit globalnya bisa
 * ditembus jauh melebihi angka yang dikonfigurasi.
 *
 * @upstash/ratelimit nyimpen counter di Upstash Redis (lewat REST API,
 * bukan koneksi TCP persisten -- cocok untuk serverless) sehingga SEMUA
 * instance baca/tulis ke counter yang sama. Limit jadi benar-benar global.
 *
 * Env var otomatis terisi oleh Vercel setelah database Upstash Redis
 * dibuat & di-connect ke project ini lewat tab Storage di dashboard.
 * Vercel menamainya KV_REST_API_URL / KV_REST_API_TOKEN (bukan
 * UPSTASH_REDIS_REST_URL/...TOKEN seperti nama default Upstash) --
 * makanya di sini dibaca eksplisit, bukan pakai Redis.fromEnv().
 */
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

function makeLimiter(prefix: string, limit: number, windowSeconds: number) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    prefix: `rl:${prefix}`,
  })
}

/** Membatasi percobaan login admin -- melindungi dari brute-force password admin. */
const authLimiter = makeLimiter('auth', 10, 15 * 60)

/** Membatasi pendaftaran akun publik (register) -- mencegah spam pembuatan akun. */
const userRegisterLimiter = makeLimiter('user-register', 5, 60 * 60)

/** Membatasi percobaan login akun publik -- melindungi dari brute-force password. */
const userLoginLimiter = makeLimiter('user-login', 10, 15 * 60)

/**
 * Membatasi percobaan submit kode verifikasi -- kode 6-digit punya ruang
 * kombinasi kecil (1 juta), jadi harus dibatasi ketat supaya tidak bisa
 * ditebak lewat brute-force sebelum masa berlaku 30 menitnya habis.
 */
const verifyCodeLimiter = makeLimiter('verify-code', 10, 15 * 60)

/** Membatasi pengiriman formulir kontak publik -- mencegah spam otomatis. */
const contactFormLimiter = makeLimiter('contact-form', 5, 60 * 60)

/**
 * Membatasi pengiriman formulir PPDB -- lebih ketat dari rate limiter umum
 * karena tiap submit menulis baris DB + hingga 4 berkas ke disk (operasi
 * jauh lebih "mahal" daripada request biasa).
 */
const ppdbSubmitLimiter = makeLimiter('ppdb-submit', 5, 60 * 60)

/**
 * Membatasi cek status pendaftaran publik. Nomor pendaftaran + tanggal
 * lahir adalah kombinasi yang bisa saja ditebak (brute-force) bila tidak
 * dibatasi -- endpoint ini sengaja dibuat jauh lebih ketat daripada
 * rate limiter umum untuk memperlambat percobaan semacam itu.
 */
const ppdbStatusCheckLimiter = makeLimiter('ppdb-status', 15, 60 * 60)

/** Batas umum untuk seluruh API sebagai lapisan pertahanan tambahan. */
const generalLimiter = makeLimiter('general', 120, 60)

/**
 * Identifier yang dipakai sebagai key rate limit. Pakai IP asli client.
 * WAJIB app.set('trust proxy', ...) sudah dikonfigurasi di app.ts supaya
 * req.ip membaca X-Forwarded-For dengan benar di belakang proxy Vercel --
 * kalau tidak, semua request bisa keidentifikasi sebagai satu "client"
 * yang sama, atau malah bisa di-spoof lewat header.
 */
function identifierFor(req: Request): string {
  return req.ip ?? 'unknown'
}

/** Bungkus satu Ratelimit instance jadi Express middleware. */
function toMiddleware(limiter: Ratelimit, errorMessage: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { success, limit, remaining, reset } = await limiter.limit(identifierFor(req))

      res.setHeader('RateLimit-Limit', limit.toString())
      res.setHeader('RateLimit-Remaining', remaining.toString())
      res.setHeader('RateLimit-Reset', reset.toString())

      if (!success) {
        res.status(429).json({ error: errorMessage })
        return
      }
      next()
    } catch (err) {
      // Fail-closed: kalau Redis tidak bisa dihubungi, TOLAK request alih-alih
      // meloloskannya tanpa batasan. Endpoint auth/login lebih aman "sementara
      // tidak bisa diakses" daripada "sementara tidak ada rate limit sama sekali".
      console.error('[rateLimiter] Redis error, menolak request demi keamanan:', err)
      res.status(503).json({ error: 'Layanan sedang sibuk, coba lagi sebentar lagi.' })
    }
  }
}

export const authRateLimiter = toMiddleware(
  authLimiter,
  'Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.',
)

export const userRegisterRateLimiter = toMiddleware(
  userRegisterLimiter,
  'Terlalu banyak percobaan pendaftaran akun dari perangkat ini. Coba lagi dalam beberapa jam.',
)

export const userLoginRateLimiter = toMiddleware(
  userLoginLimiter,
  'Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.',
)

export const verifyCodeRateLimiter = toMiddleware(
  verifyCodeLimiter,
  'Terlalu banyak percobaan verifikasi. Coba lagi dalam beberapa menit.',
)

export const contactFormRateLimiter = toMiddleware(
  contactFormLimiter,
  'Terlalu banyak pesan terkirim. Coba lagi nanti.',
)

export const ppdbSubmitRateLimiter = toMiddleware(
  ppdbSubmitLimiter,
  'Terlalu banyak percobaan pendaftaran dari perangkat ini. Coba lagi dalam beberapa jam.',
)

export const ppdbStatusCheckRateLimiter = toMiddleware(
  ppdbStatusCheckLimiter,
  'Terlalu banyak percobaan cek status. Coba lagi dalam beberapa jam.',
)

export const generalRateLimiter = toMiddleware(generalLimiter, 'Terlalu banyak permintaan. Coba lagi nanti.')