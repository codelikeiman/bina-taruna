/**
 * Alur status pendaftaran PPDB. Sengaja dibuat sebagai union string (bukan
 * enum TypeScript) supaya nilainya identik dengan ENUM di MySQL dan mudah
 * dipakai langsung oleh Zod (z.enum) — lihat ppdb.validation.ts.
 *
 * Alur normal:
 *   diajukan -> diverifikasi -> terkirim_ke_dinas -> diterima/ditolak
 * Jalur revisi:
 *   diajukan/diverifikasi -> perlu_revisi -> diverifikasi (setelah diperbaiki)
 * Penolakan bisa terjadi dari status mana pun sebelum terkirim_ke_dinas.
 *
 * Transisi yang DIIZINKAN didefinisikan di ppdb.registrations.service.ts
 * (STATUS_TRANSITIONS) — daftar di sini hanya mendefinisikan nilai yang sah.
 */
export const REGISTRATION_STATUSES = [
  'diajukan',
  'perlu_revisi',
  'diverifikasi',
  'terkirim_ke_dinas',
  'diterima',
  'ditolak',
] as const

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number]

/** Label Indonesia untuk ditampilkan di UI (dipakai juga oleh respons status-check publik). */
export const STATUS_LABELS: Record<RegistrationStatus, string> = {
  diajukan: 'Menunggu Verifikasi',
  perlu_revisi: 'Perlu Revisi',
  diverifikasi: 'Terverifikasi',
  terkirim_ke_dinas: 'Terkirim ke Dinas Pendidikan',
  diterima: 'Diterima',
  ditolak: 'Tidak Diterima',
}

export const DOCUMENT_TYPES = ['kk', 'akta', 'ijazah', 'foto'] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

/** Nama tampilan tiap jenis dokumen — dipakai di pesan error & UI admin. */
export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  kk: 'Kartu Keluarga (KK)',
  akta: 'Akta Kelahiran',
  ijazah: 'Ijazah / SKL',
  foto: 'Pas Foto',
}

export const GENDER_LABELS: Record<'L' | 'P', string> = {
  L: 'Laki-laki',
  P: 'Perempuan',
}

/** 7 opsi agama sesuai kolom "Agama" yang diakui secara resmi di dokumen kependudukan Indonesia. */
export const RELIGION_OPTIONS = [
  'Islam',
  'Kristen',
  'Katolik',
  'Hindu',
  'Buddha',
  'Khonghucu',
  'Kepercayaan Terhadap Tuhan YME',
] as const

export interface PpdbSettings {
  academicYear: string
  isOpen: boolean
  closedMessage: string
}

export interface DocumentMeta {
  id: number
  docType: DocumentType
  originalFilename: string
  mimeType: string
  sizeBytes: number
  uploadedAt: string
}

/** Ringkasan yang dikembalikan ke publik langsung setelah submit berhasil. */
export interface RegistrationSummary {
  registrationNumber: string
  status: RegistrationStatus
  statusLabel: string
  fullName: string
  academicYear: string
  majorName: string | null
  submittedAt: string
}
