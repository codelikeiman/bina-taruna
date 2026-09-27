// Lihat catatan proxy/VITE_API_BASE_URL di siteContentApi.js — pola yang
// sama dipakai di sini.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const AUTH_TOKEN_KEY = 'ppdb-user-token'
export const AUTH_USER_KEY = 'ppdb-user-data'

export class UsersApiError extends Error {
  constructor(message, fields = null) {
    super(message)
    this.name = 'UsersApiError'
    this.fields = fields
  }
}

async function parseJsonResponse(res) {
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : null
  if (!res.ok) {
    throw new UsersApiError(data?.error ?? 'Terjadi kesalahan. Silakan coba lagi.', data?.fields ?? null)
  }
  return data
}

/** Mendaftarkan akun baru. Status awal: menunggu persetujuan admin. */
export async function registerUser({ name, email, password }) {
  const res = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  return parseJsonResponse(res)
}

/** Submit kode verifikasi 6-digit yang dikirim admin lewat email. */
export async function verifyUserCode({ email, code }) {
  const res = await fetch(`${API_BASE_URL}/api/users/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
  return parseJsonResponse(res)
}

/** Login akun yang sudah terverifikasi. Menyimpan token & data user di localStorage bila berhasil. */
export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await parseJsonResponse(res)
  localStorage.setItem(AUTH_TOKEN_KEY, data.token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user))
  return data
}

export function logoutUser() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

/** Header Authorization siap pakai untuk fetch() ke endpoint yang butuh login user. */
export function authHeader() {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
