import { ApiError, API_BASE_URL, getStoredToken, request } from './api'

export type RegistrationStatus = 'diajukan' | 'perlu_revisi' | 'diverifikasi' | 'terkirim_ke_dinas' | 'diterima' | 'ditolak'

export interface PpdbSettings {
  academicYear: string
  isOpen: boolean
  closedMessage: string
}

export interface RegistrationListItem {
  id: number
  registrationNumber: string
  status: RegistrationStatus
  statusLabel: string
  fullName: string
  nisn: string
  gender: 'L' | 'P'
  phone: string
  email: string
  previousSchool: string
  majorName: string | null
  academicYear: string
  submittedAt: string
}

export interface RegistrationListResult {
  items: RegistrationListItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface RegistrationDocument {
  id: number
  docType: 'kk' | 'akta' | 'ijazah' | 'foto'
  originalFilename: string
  mimeType: string
  sizeBytes: number
  uploadedAt: string
}

export interface RegistrationDetail {
  id: number
  registrationNumber: string
  status: RegistrationStatus
  statusLabel: string
  nik: string
  nisn: string
  fullName: string
  birthPlace: string
  birthDate: string
  gender: 'L' | 'P'
  religion: string
  phone: string
  email: string
  address: string
  province: string
  city: string
  district: string
  village: string
  fatherName: string
  fatherJob: string
  fatherPhone: string
  motherName: string
  motherJob: string
  motherPhone: string
  guardianName: string | null
  guardianRelationship: string | null
  guardianJob: string | null
  guardianPhone: string | null
  majorId: number | null
  majorName: string | null
  academicYear: string
  previousSchool: string
  adminNote: string | null
  verifiedBy: string | null
  verifiedAt: string | null
  sentToDinasBy: string | null
  sentToDinasAt: string | null
  submittedIp: string | null
  createdAt: string
  updatedAt: string
  documents: RegistrationDocument[]
}

export interface ListParams {
  page?: number
  pageSize?: number
  status?: RegistrationStatus | ''
  majorId?: number | ''
  search?: string
}

function buildQuery<T extends object>(params: T): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const ppdbSettingsApi = {
  get: () => request<{ settings: PpdbSettings }>('/admin/ppdb-settings'),
  update: (data: PpdbSettings) => request<{ settings: PpdbSettings }>('/admin/ppdb-settings', { method: 'PUT', body: data }),
}

export const ppdbRegistrationsApi = {
  list: (params: ListParams = {}) => request<RegistrationListResult>(`/admin/ppdb-registrations${buildQuery(params)}`),
  get: (id: number) => request<{ registration: RegistrationDetail }>(`/admin/ppdb-registrations/${id}`),
  updateStatus: (id: number, status: RegistrationStatus, note: string) =>
    request<{ registration: RegistrationDetail }>(`/admin/ppdb-registrations/${id}/status`, {
      method: 'PUT',
      body: { status, note },
    }),
}

/**
 * Membuka dokumen (KK/akta/ijazah/foto) di tab baru. Berkas diambil lewat
 * fetch dengan header Authorization (bukan <a href> langsung ke endpoint
 * admin) karena endpoint itu butuh token Bearer yang tidak bisa disisipkan
 * di URL biasa — lihat ppdb.admin.router.ts di backend.
 */
export async function openPpdbDocument(registrationId: number, documentId: number): Promise<void> {
  const token = getStoredToken()
  const res = await fetch(`${API_BASE_URL}/api/admin/ppdb-registrations/${registrationId}/documents/${documentId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    throw new ApiError(res.status, 'Gagal memuat dokumen.')
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Beri jeda supaya tab baru sempat memuat resource sebelum URL dicabut.
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

/** Mengunduh data pendaftar terfilter sebagai CSV (untuk diunggah ke portal dinas). */
export async function exportPpdbRegistrationsCsv(params: Omit<ListParams, 'page' | 'pageSize'> = {}): Promise<void> {
  const token = getStoredToken()
  const res = await fetch(`${API_BASE_URL}/api/admin/ppdb-registrations/export${buildQuery(params)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    throw new ApiError(res.status, 'Gagal mengekspor data.')
  }
  const blob = await res.blob()
  const disposition = res.headers.get('content-disposition')
  const match = disposition?.match(/filename="?([^";]+)"?/)
  const filename = match?.[1] ?? 'ppdb-pendaftar.csv'

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
