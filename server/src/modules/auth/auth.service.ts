import bcrypt from 'bcryptjs'
import { pool } from '../../db/pool'
import { signAdminToken } from '../../utils/jwt'
import { badRequest, unauthorized } from '../../utils/httpError'

interface AdminRow {
  id: number
  name: string
  email: string
  password_hash: string
}

export async function login(email: string, password: string) {
  const { rows } = await pool.query<AdminRow>(
    'SELECT id, name, email, password_hash FROM admins WHERE email = $1 LIMIT 1',
    [email.trim().toLowerCase()],
  )
  const admin = rows[0]

  // Pesan error disamakan untuk email tidak ditemukan maupun password salah,
  // supaya penyerang tidak bisa memakai respons ini untuk menebak email admin
  // yang valid satu per satu (user enumeration).
  if (!admin) throw unauthorized('Email atau password salah.')

  const valid = await bcrypt.compare(password, admin.password_hash)
  if (!valid) throw unauthorized('Email atau password salah.')

  const payload = { id: admin.id, email: admin.email, name: admin.name }
  const token = signAdminToken(payload)
  return { token, admin: payload }
}

export async function changePassword(adminId: number, currentPassword: string, newPassword: string) {
  const { rows } = await pool.query<AdminRow>(
    'SELECT id, name, email, password_hash FROM admins WHERE id = $1 LIMIT 1',
    [adminId],
  )
  const admin = rows[0]
  if (!admin) throw unauthorized()

  const valid = await bcrypt.compare(currentPassword, admin.password_hash)
  if (!valid) throw badRequest('Password saat ini tidak sesuai.')

  const newHash = await bcrypt.hash(newPassword, 12)
  await pool.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [newHash, adminId])
}
