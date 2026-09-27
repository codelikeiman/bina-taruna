import rateLimit from 'express-rate-limit'

/** Membatasi percobaan login — melindungi dari brute-force password admin. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.' },
})

/** Membatasi pendaftaran akun publik (register) — mencegah spam pembuatan akun. */
export const userRegisterRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan pendaftaran akun dari perangkat ini. Coba lagi dalam beberapa jam.' },
})

/** Membatasi percobaan login akun publik — melindungi dari brute-force password. */
export const userLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.' },
})

/**
 * Membatasi percobaan submit kode verifikasi — kode 6-digit punya ruang
 * kombinasi kecil (1 juta), jadi harus dibatasi ketat supaya tidak bisa
 * ditebak lewat brute-force sebelum masa berlaku 30 menitnya habis.
 */
export const verifyCodeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan verifikasi. Coba lagi dalam beberapa menit.' },
})

/** Membatasi pengiriman formulir kontak publik — mencegah spam otomatis. */
export const contactFormRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak pesan terkirim. Coba lagi nanti.' },
})

/**
 * Membatasi pengiriman formulir PPDB — lebih ketat dari rate limiter umum
 * karena tiap submit menulis baris DB + hingga 4 berkas ke disk (operasi
 * jauh lebih "mahal" daripada request biasa).
 */
export const ppdbSubmitRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan pendaftaran dari perangkat ini. Coba lagi dalam beberapa jam.' },
})

/**
 * Membatasi cek status pendaftaran publik. Nomor pendaftaran + tanggal
 * lahir adalah kombinasi yang bisa saja ditebak (brute-force) bila tidak
 * dibatasi — endpoint ini sengaja dibuat jauh lebih ketat daripada
 * rate limiter umum untuk memperlambat percobaan semacam itu.
 */
export const ppdbStatusCheckRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan cek status. Coba lagi dalam beberapa jam.' },
})

/** Batas umum untuk seluruh API sebagai lapisan pertahanan tambahan. */
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
})
