import type { ResourceItem } from '../types/resource'

// Saat development, permintaan /api diteruskan otomatis ke backend Express
// oleh proxy di vite.config.ts (lihat API_PROXY_TARGET di sana). Saat
// production, atur VITE_API_BASE_URL bila admin dashboard ini di-deploy
// sebagai project Vercel terpisah dari backend (beda domain) — lihat
// .env.example. Kosongkan/tidak perlu diisi bila API berada di origin yang
// sama (mis. lewat rewrite/reverse proxy yang sama).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
export { API_BASE_URL }

const TOKEN_STORAGE_KEY = 'bina_taruna_admin_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
  else localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * Error terstruktur dari API. `fields` (bila ada) berisi pesan error per
 * field dari validasi Zod backend, dipakai untuk menyorot input yang salah
 * langsung di formulir alih-alih hanya menampilkan pesan generik.
 */
export class ApiError extends Error {
  public readonly status: number
  public readonly fields?: Record<string, string>

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  /** Lewati header Authorization — dipakai untuk login & submit kontak publik. */
  skipAuth?: boolean
}

/**
 * Diekspor (bukan hanya dipakai internal file ini) supaya modul lain yang
 * butuh pola fetch+auth+error-handling identik — mis. lib/ppdbApi.ts — tidak
 * perlu menduplikasi logikanya sendiri.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, skipAuth = false } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (!skipAuth) {
    const token = getStoredToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // 204 No Content (dipakai oleh delete) — tidak ada body untuk di-parse.
  if (res.status === 204) return undefined as T

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : undefined

  if (!res.ok) {
    const message = (data && typeof data === 'object' && 'error' in data ? (data.error as string) : null) ?? `Permintaan gagal (${res.status}).`
    const fields = data && typeof data === 'object' && 'fields' in data ? (data.fields as Record<string, string>) : undefined
    throw new ApiError(res.status, message, fields)
  }

  return data as T
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export interface AdminIdentity {
  id: number
  email: string
  name: string
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; admin: AdminIdentity }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    }),
  me: () => request<{ admin: AdminIdentity }>('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    }),
}

// ---------------------------------------------------------------------------
// Unggah foto (mis. foto siswa berprestasi). Terpisah dari `request()` di
// atas karena memakai multipart/form-data, bukan JSON — jadi TIDAK
// menyertakan header Content-Type manual (browser yang mengisinya sendiri
// beserta boundary-nya).
// ---------------------------------------------------------------------------
export async function uploadPhoto(file: File): Promise<{ url: string }> {
  const token = getStoredToken()
  const formData = new FormData()
  formData.append('photo', file)

  const res = await fetch(`${API_BASE_URL}/api/admin/uploads/photo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : undefined

  if (!res.ok) {
    const message = (data && typeof data === 'object' && 'error' in data ? (data.error as string) : null) ?? `Gagal mengunggah foto (${res.status}).`
    throw new ApiError(res.status, message)
  }

  return data as { url: string }
}

// ---------------------------------------------------------------------------
// Generic list-resource CRUD (stats, teachers, achievements, dst.)
// ---------------------------------------------------------------------------
export const resourceApi = {
  list: (key: string) => request<{ items: ResourceItem[] }>(`/admin/${key}`),
  create: (key: string, data: Record<string, unknown>) =>
    request<{ item: ResourceItem }>(`/admin/${key}`, { method: 'POST', body: data }),
  update: (key: string, id: number, data: Record<string, unknown>) =>
    request<{ item: ResourceItem }>(`/admin/${key}/${id}`, { method: 'PUT', body: data }),
  remove: (key: string, id: number) => request<void>(`/admin/${key}/${id}`, { method: 'DELETE' }),
  reorder: (key: string, orderedIds: number[]) =>
    request<{ items: ResourceItem[] }>(`/admin/${key}/reorder`, { method: 'PUT', body: { orderedIds } }),
}

// ---------------------------------------------------------------------------
// School profile (singleton)
// ---------------------------------------------------------------------------
export interface SchoolProfile {
  name: string
  short_name: string
  full_legal_name: string
  tagline: string
  motto: string
  founded_year: number
  accreditation: string
  npsn: string
  email: string
  phone: string
  whatsapp: string
  address_street: string
  address_area: string
  address_city: string
  instagram: string
  youtube: string
  facebook: string
}

export const schoolProfileApi = {
  get: () => request<{ item: SchoolProfile }>('/admin/school-profile'),
  update: (data: SchoolProfile) =>
    request<{ item: SchoolProfile }>('/admin/school-profile', { method: 'PUT', body: data }),
}

// ---------------------------------------------------------------------------
// Vision & mission
// ---------------------------------------------------------------------------
export const visionApi = {
  get: () => request<{ vision: string; missions: ResourceItem[] }>('/admin/vision-mission'),
  updateVision: (vision: string) =>
    request<{ vision: string }>('/admin/vision-mission/vision', { method: 'PUT', body: { vision } }),
}

// ---------------------------------------------------------------------------
// Contact messages inbox
// ---------------------------------------------------------------------------
export interface ContactMessage {
  id: number
  name: string
  email: string
  message: string
  is_read: 0 | 1
  created_at: string
}

export const contactApi = {
  list: () => request<{ items: ContactMessage[] }>('/admin/contact-messages'),
  markRead: (id: number) => request<{ message: string }>(`/admin/contact-messages/${id}/read`, { method: 'PUT' }),
  remove: (id: number) => request<void>(`/admin/contact-messages/${id}`, { method: 'DELETE' }),
}
