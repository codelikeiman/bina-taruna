// Saat development, permintaan ke /api diteruskan ke backend Express oleh
// proxy di vite.config.js. Saat production, atur VITE_API_BASE_URL ke alamat
// API yang sesungguhnya (mis. https://api.smabinataruna.sch.id) di file .env
// sebelum menjalankan `npm run build` — lihat .env.example.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export { API_BASE_URL }

/**
 * Foto/gambar dari API bisa berbentuk dua hal: URL absolut Supabase Storage
 * (mis. "https://xxxx.supabase.co/storage/v1/object/public/photos/...") —
 * ini dipakai apa adanya — atau (data lama/fallback) path relatif terhadap
 * origin API seperti "/uploads/photos/xxx.jpg", yang perlu digabung dengan
 * API_BASE_URL dulu. Dipakai oleh useSiteContent.js untuk setiap field
 * *Url/*photoUrl supaya <img src={...}> selalu dapat URL yang benar.
 */
export function resolveMediaUrl(url) {
  if (!url) return null
  return /^https?:\/\//.test(url) ? url : `${API_BASE_URL}${url}`
}

class SiteContentError extends Error {
  constructor(message) {
    super(message)
    this.name = 'SiteContentError'
  }
}

/** Mengambil seluruh konten publik situs dalam satu panggilan. */
export async function fetchSiteContent() {
  const res = await fetch(`${API_BASE_URL}/api/site-content`)
  if (!res.ok) {
    throw new SiteContentError('Gagal memuat konten situs dari server.')
  }
  return res.json()
}

/** Mengirim pesan dari formulir kontak publik. */
export async function submitContactMessage({ name, email, message }) {
  const res = await fetch(`${API_BASE_URL}/api/contact-messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : null

  if (!res.ok) {
    const errorMessage = data?.error ?? 'Gagal mengirim pesan. Silakan coba lagi.'
    throw new SiteContentError(errorMessage)
  }

  return data
}
