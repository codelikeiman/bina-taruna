// Lihat catatan proxy/VITE_API_BASE_URL di siteContentApi.js — pola yang
// sama dipakai di sini.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

import { authHeader } from './usersApi'

export class PpdbError extends Error {
  /**
   * @param {string} message
   * @param {Record<string, string> | null} fields Error per-field dari Zod
   *   (bentuk `{error, fields}` yang dikembalikan errorHandler.ts di backend),
   *   dipakai PpdbWizard untuk menyorot field yang salah alih-alih hanya
   *   menampilkan satu pesan generik.
   */
  constructor(message, fields = null) {
    super(message)
    this.name = 'PpdbError'
    this.fields = fields
  }
}

async function parseJsonResponse(res) {
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : null
  if (!res.ok) {
    throw new PpdbError(data?.error ?? 'Terjadi kesalahan. Silakan coba lagi.', data?.fields ?? null)
  }
  return data
}

/** Status pendaftaran PPDB saat ini: tahun ajaran & apakah formulir dibuka. */
export async function fetchPpdbSettings() {
  const res = await fetch(`${API_BASE_URL}/api/ppdb-settings`)
  const data = await parseJsonResponse(res)
  return data.settings
}

/** Daftar jurusan/peminatan yang tersedia (bisa kosong bila sekolah tidak memakai penjurusan). */
export async function fetchPpdbMajors() {
  const res = await fetch(`${API_BASE_URL}/api/ppdb-majors`)
  const data = await parseJsonResponse(res)
  return data.items ?? []
}

/**
 * Mengirim formulir pendaftaran PPDB. `fields` adalah objek data teks,
 * `files` adalah objek { kk, akta, ijazah, foto } berisi File dari <input>.
 * Membutuhkan akun yang sudah login & terverifikasi (lihat usersApi.js) —
 * header Authorization disertakan otomatis dari token tersimpan.
 */
export async function submitPpdbRegistration(fields, files) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value ?? '')
  }
  for (const [key, file] of Object.entries(files)) {
    if (file) formData.append(key, file)
  }

  const res = await fetch(`${API_BASE_URL}/api/ppdb-registrations`, {
    method: 'POST',
    headers: { ...authHeader() },
    body: formData,
  })
  const data = await parseJsonResponse(res)
  return data.registration
}

/** Status pendaftaran PPDB terbaru milik akun yang sedang login (null bila belum pernah mendaftar). */
export async function fetchMyPpdbStatus() {
  const res = await fetch(`${API_BASE_URL}/api/ppdb-registrations/my-status`, {
    headers: { ...authHeader() },
  })
  const data = await parseJsonResponse(res)
  return data.registration
}

/** Cek status pendaftaran memakai nomor pendaftaran + tanggal lahir. */
export async function checkPpdbStatus({ registrationNumber, birthDate }) {
  const res = await fetch(`${API_BASE_URL}/api/ppdb-registrations/status-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrationNumber, birthDate }),
  })
  const data = await parseJsonResponse(res)
  return data.result
}
