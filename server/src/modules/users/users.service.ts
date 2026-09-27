import { randomInt } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { pool } from '../../db/pool'
import { badRequest, conflict, notFound, unauthorized } from '../../utils/httpError'
import { signUserToken } from '../../utils/jwt'
import { buildVerificationCodeEmail, sendMail } from '../../utils/mailer'
import type { AuthenticatedUser } from '../../types/express'
import type { LoginInput, RegisterInput } from './users.validation'

export type UserStatus = 'pending_admin_approval' | 'pending_verification' | 'verified'

interface UserRow {
  id: number
  name: string
  email: string
  password_hash: string
  status: UserStatus
  verification_code_hash: string | null
  verification_code_expires: Date | null
}

const VERIFICATION_CODE_TTL_MS = 30 * 60 * 1000

function generateSixDigitCode(): string {
  // randomInt (CSPRNG) alih-alih Math.random() — kode ini setara OTP,
  // jadi harus tidak bisa ditebak/direproduksi.
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

export async function registerUser(input: RegisterInput) {
  const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [input.email])
  if (existing.length > 0) {
    throw conflict('Email ini sudah terdaftar. Silakan login, atau hubungi admin bila akun Anda belum diverifikasi.')
  }

  const passwordHash = await bcrypt.hash(input.password, 12)
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO users (name, email, password_hash, status) VALUES ($1, $2, $3, 'pending_admin_approval') RETURNING id`,
    [input.name, input.email, passwordHash],
  )

  return {
    id: rows[0].id,
    name: input.name,
    email: input.email,
    status: 'pending_admin_approval' as UserStatus,
  }
}

export interface AdminUserListItem {
  id: number
  name: string
  email: string
  status: UserStatus
  approvedByName: string | null
  approvedAt: Date | null
  verifiedAt: Date | null
  createdAt: Date
}

/** Daftar akun user untuk dashboard admin, opsional difilter berdasarkan status. */
export async function listUsers(status?: UserStatus): Promise<AdminUserListItem[]> {
  const where = status ? 'WHERE u.status = $1' : ''
  const values = status ? [status] : []
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.status, u.approved_at, u.verified_at, u.created_at, a.name AS approved_by_name
     FROM users u
     LEFT JOIN admins a ON a.id = u.approved_by
     ${where}
     ORDER BY u.created_at DESC`,
    values,
  )
  return rows.map((row) => ({
    id: row.id as number,
    name: row.name as string,
    email: row.email as string,
    status: row.status as UserStatus,
    approvedByName: (row.approved_by_name as string | null) ?? null,
    approvedAt: row.approved_at as Date | null,
    verifiedAt: row.verified_at as Date | null,
    createdAt: row.created_at as Date,
  }))
}

/**
 * Admin menyetujui akun yang baru daftar: generate kode 6-digit, simpan
 * HASH-nya (bukan kode polos) + waktu kedaluwarsa, lalu kirim kode asli ke
 * email user lewat Nodemailer. Bila pengiriman email gagal, seluruh
 * perubahan status TIDAK disimpan (dilempar ke pemanggil) — supaya admin
 * tahu harus mencoba lagi, alih-alih user terjebak status "terkirim"
 * padahal tidak pernah menerima kodenya.
 */
export async function approveUserAndSendCode(userId: number, adminId: number): Promise<void> {
  const { rows } = await pool.query<UserRow>('SELECT id, name, email, status FROM users WHERE id = $1 LIMIT 1', [
    userId,
  ])
  const user = rows[0]
  if (!user) throw notFound('Akun pengguna tidak ditemukan.')
  if (user.status === 'verified') {
    throw conflict('Akun ini sudah terverifikasi.')
  }

  const code = generateSixDigitCode()
  const codeHash = await bcrypt.hash(code, 10)
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS)

  // Kirim email DULU, baru simpan ke DB kalau berhasil — supaya tidak ada
  // kode "aktif" di database yang penerimanya sebenarnya tidak pernah
  // menerima email tersebut.
  const { subject, html } = buildVerificationCodeEmail(user.name, code)
  await sendMail({ to: user.email, subject, html })

  await pool.query(
    `UPDATE users
     SET status = 'pending_verification', verification_code_hash = $1, verification_code_expires = $2,
         approved_by = $3, approved_at = NOW()
     WHERE id = $4`,
    [codeHash, expiresAt, adminId, userId],
  )
}

/**
 * Admin mengirim ULANG kode verifikasi (mis. user bilang tidak menerima
 * email / kode sudah kedaluwarsa). Sama seperti approveUserAndSendCode
 * tapi mengizinkan status awal 'pending_verification' juga.
 */
export async function resendVerificationCode(userId: number, adminId: number): Promise<void> {
  const { rows } = await pool.query<UserRow>('SELECT id, name, email, status FROM users WHERE id = $1 LIMIT 1', [
    userId,
  ])
  const user = rows[0]
  if (!user) throw notFound('Akun pengguna tidak ditemukan.')
  if (user.status === 'verified') {
    throw conflict('Akun ini sudah terverifikasi.')
  }

  const code = generateSixDigitCode()
  const codeHash = await bcrypt.hash(code, 10)
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS)

  const { subject, html } = buildVerificationCodeEmail(user.name, code)
  await sendMail({ to: user.email, subject, html })

  await pool.query(
    `UPDATE users
     SET status = 'pending_verification', verification_code_hash = $1, verification_code_expires = $2,
         approved_by = $3, approved_at = NOW()
     WHERE id = $4`,
    [codeHash, expiresAt, adminId, userId],
  )
}

export async function verifyUserCode(email: string, code: string): Promise<void> {
  const { rows } = await pool.query<UserRow>(
    'SELECT id, status, verification_code_hash, verification_code_expires FROM users WHERE email = $1 LIMIT 1',
    [email],
  )
  const user = rows[0]
  // Pesan disamakan untuk email tidak ditemukan / status salah / kode salah
  // — mencegah enumerasi email terdaftar lewat respons error yang berbeda-beda.
  const genericError = () => badRequest('Kode verifikasi tidak valid, sudah kedaluwarsa, atau akun belum disetujui admin.')

  if (!user) throw genericError()
  if (user.status !== 'pending_verification' || !user.verification_code_hash || !user.verification_code_expires) {
    throw genericError()
  }
  if (user.verification_code_expires.getTime() < Date.now()) {
    throw badRequest('Kode verifikasi sudah kedaluwarsa. Silakan minta admin mengirim ulang kode.')
  }

  const valid = await bcrypt.compare(code, user.verification_code_hash)
  if (!valid) throw genericError()

  await pool.query(
    `UPDATE users
     SET status = 'verified', verified_at = NOW(), verification_code_hash = NULL, verification_code_expires = NULL
     WHERE id = $1`,
    [user.id],
  )
}

export async function loginUser(input: LoginInput) {
  const { rows } = await pool.query<UserRow>(
    'SELECT id, name, email, password_hash, status FROM users WHERE email = $1 LIMIT 1',
    [input.email],
  )
  const user = rows[0]

  // Pesan disamakan untuk email tidak ditemukan maupun password salah,
  // sama seperti auth.service.ts admin — mencegah enumerasi email.
  if (!user) throw unauthorized('Email atau password salah.')

  const valid = await bcrypt.compare(input.password, user.password_hash)
  if (!valid) throw unauthorized('Email atau password salah.')

  if (user.status === 'pending_admin_approval') {
    throw unauthorized('Akun Anda masih menunggu persetujuan admin sebelum kode verifikasi dapat dikirim.')
  }
  if (user.status === 'pending_verification') {
    throw unauthorized('Akun Anda belum diverifikasi. Silakan masukkan kode verifikasi yang dikirim ke email Anda.')
  }

  const payload: AuthenticatedUser = { id: user.id, email: user.email, name: user.name }
  const token = signUserToken(payload)
  return { token, user: payload }
}
