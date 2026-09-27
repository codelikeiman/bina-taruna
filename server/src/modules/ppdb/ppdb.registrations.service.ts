import { randomBytes } from 'node:crypto'
import { pool } from '../../db/pool'
import { badRequest, conflict, notFound } from '../../utils/httpError'
import { decryptField, encryptField, hashForLookup } from '../../utils/crypto'
import { buildPpdbStatusEmail, sendMail } from '../../utils/mailer'
import type { AuthenticatedAdmin } from '../../types/express'
import {
  deleteRegistrationFiles,
  readDocumentFile,
  saveDocumentFiles,
  validateDocumentFiles,
  type UploadedFiles,
} from './ppdb.documents'
import { getPpdbSettings } from './ppdb.settings.service'
import { buildCsv } from './ppdb.csv'
import {
  GENDER_LABELS,
  STATUS_LABELS,
  type RegistrationStatus,
  type RegistrationSummary,
} from './ppdb.types'
import type { RegistrationSubmitInput } from './ppdb.validation'

/**
 * Transisi status yang diizinkan (state machine). Admin tidak bisa
 * melompat status secara sembarangan lewat API (mis. langsung dari
 * "diajukan" ke "diterima") — ini dicek di updateRegistrationStatus().
 * Menyimpan ulang status yang SAMA (mis. sekadar mengedit catatan) selalu
 * diizinkan dan tidak perlu terdaftar di sini.
 */
const STATUS_TRANSITIONS: Record<RegistrationStatus, RegistrationStatus[]> = {
  diajukan: ['perlu_revisi', 'diverifikasi', 'ditolak'],
  perlu_revisi: ['diverifikasi', 'ditolak'],
  diverifikasi: ['terkirim_ke_dinas', 'perlu_revisi', 'ditolak'],
  terkirim_ke_dinas: ['diterima', 'ditolak'],
  diterima: [],
  ditolak: [],
}

function formatDateOnly(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value ?? '')
}

function formatDateTime(value: unknown): string {
  if (value instanceof Date) return value.toISOString().replace('T', ' ').slice(0, 19)
  return String(value ?? '')
}

async function generateUniqueRegistrationNumber(academicYear: string): Promise<string> {
  const yearPart = academicYear.split('/')[0] || String(new Date().getFullYear())
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = `PPDB-${yearPart}-${randomBytes(4).toString('hex').toUpperCase()}`
    const { rows } = await pool.query(
      'SELECT id FROM ppdb_registrations WHERE registration_number = $1 LIMIT 1',
      [candidate],
    )
    if (rows.length === 0) return candidate
  }
  // Praktis mustahil tercapai (ruang kombinasi 16^8), tapi tetap ditangani
  // secara eksplisit daripada membiarkan loop diam-diam mengembalikan undefined.
  throw new Error('Gagal membuat nomor pendaftaran unik setelah beberapa percobaan.')
}

/**
 * Membersihkan baris + berkas pendaftaran yang gagal tersimpan LENGKAP
 * (mis. gagal menulis salah satu berkas ke disk setelah baris DB terlanjur
 * dibuat). Dipanggil dari createRegistration() — bukan untuk penghapusan
 * pendaftaran biasa oleh admin, yang memang belum disediakan sebagai fitur
 * (lihat catatan di README bagian PPDB).
 */
async function cleanupFailedRegistration(registrationId: number): Promise<void> {
  await deleteRegistrationFiles(registrationId).catch(() => undefined)
  await pool.query('DELETE FROM ppdb_registrations WHERE id = $1', [registrationId]).catch(() => undefined)
}

export interface CreateRegistrationMeta {
  ip: string | null
  userId: number
}

export async function createRegistration(
  input: RegistrationSubmitInput,
  files: UploadedFiles,
  meta: CreateRegistrationMeta,
): Promise<RegistrationSummary> {
  const settings = await getPpdbSettings()
  if (!settings.isOpen) {
    throw conflict('Pendaftaran PPDB saat ini belum atau tidak sedang dibuka. Silakan cek kembali nanti.')
  }

  // Satu akun hanya boleh punya SATU pendaftaran "aktif" pada satu waktu.
  // Bila attempt terakhirnya berstatus 'ditolak', akun boleh mendaftar lagi
  // (attempt baru) — sesuai keputusan produk: ditolak bukan berarti akun
  // diblokir permanen dari PPDB.
  const { rows: existingRows } = await pool.query(
    'SELECT status FROM ppdb_registrations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [meta.userId],
  )
  const latestOwnStatus = existingRows[0]?.status as RegistrationStatus | undefined
  if (latestOwnStatus && latestOwnStatus !== 'ditolak') {
    throw conflict('Akun Anda sudah memiliki pendaftaran PPDB yang sedang berjalan. Gunakan menu cek status untuk memantaunya.')
  }

  const { rows: majorRows } = await pool.query('SELECT id, name FROM ppdb_majors ORDER BY sort_order ASC')
  let majorId: number | null = null
  let majorName: string | null = null
  if (majorRows.length > 0) {
    if (!input.majorId) throw badRequest('Jurusan/peminatan wajib dipilih.')
    const match = majorRows.find((m) => m.id === input.majorId)
    if (!match) throw badRequest('Jurusan/peminatan yang dipilih tidak valid.')
    majorId = match.id as number
    majorName = match.name as string
  }

  const nikHash = hashForLookup(input.nik)
  const { rows: dup } = await pool.query(
    'SELECT id FROM ppdb_registrations WHERE nik_hash = $1 LIMIT 1',
    [nikHash],
  )
  if (dup.length > 0) {
    throw conflict('NIK ini sudah pernah terdaftar sebelumnya. Bila menurut Anda ini keliru, silakan hubungi pihak sekolah.')
  }

  // Validasi isi berkas (magic bytes) SEBELUM ada satu baris/berkas pun
  // ditulis — supaya tidak ada data "setengah jadi" bila salah satu berkas
  // ternyata tidak valid.
  const validatedFiles = await validateDocumentFiles(files)

  const registrationNumber = await generateUniqueRegistrationNumber(settings.academicYear)
  const nikEncrypted = encryptField(input.nik)

  const columns = [
    'user_id', 'registration_number', 'status',
    'nik_encrypted', 'nik_hash', 'nisn', 'full_name', 'birth_place', 'birth_date', 'gender', 'religion', 'phone', 'email',
    'address', 'province', 'city', 'district', 'village',
    'father_name', 'father_job', 'father_phone',
    'mother_name', 'mother_job', 'mother_phone',
    'guardian_name', 'guardian_relationship', 'guardian_job', 'guardian_phone',
    'major_id', 'academic_year', 'previous_school',
    'agreement_accepted_at', 'submitted_ip',
  ]
  const values: unknown[] = [
    meta.userId, registrationNumber, 'diajukan',
    nikEncrypted, nikHash, input.nisn, input.fullName, input.birthPlace, input.birthDate, input.gender, input.religion, input.phone, input.email,
    input.address, input.province, input.city, input.district, input.village,
    input.fatherName, input.fatherJob, input.fatherPhone,
    input.motherName, input.motherJob, input.motherPhone,
    input.hasGuardian ? input.guardianName : null,
    input.hasGuardian ? input.guardianRelationship : null,
    input.hasGuardian ? input.guardianJob : null,
    input.hasGuardian ? input.guardianPhone : null,
    majorId, settings.academicYear, input.previousSchool,
    new Date(), meta.ip,
  ]

  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
  const { rows: inserted } = await pool.query<{ id: number }>(
    `INSERT INTO ppdb_registrations (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id`,
    values,
  )
  const registrationId = inserted[0].id

  try {
    const saved = await saveDocumentFiles(registrationId, validatedFiles)
    for (const doc of saved) {
      await pool.query(
        `INSERT INTO ppdb_documents (registration_id, doc_type, original_filename, stored_filename, mime_type, size_bytes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [registrationId, doc.docType, doc.originalFilename, doc.storedFilename, doc.mimeType, doc.sizeBytes],
      )
    }
  } catch (err) {
    await cleanupFailedRegistration(registrationId)
    throw err
  }

  return {
    registrationNumber,
    status: 'diajukan',
    statusLabel: STATUS_LABELS.diajukan,
    fullName: input.fullName,
    academicYear: settings.academicYear,
    majorName,
    submittedAt: new Date().toISOString(),
  }
}

/**
 * Status pendaftaran PPDB terbaru milik user yang sedang login. Berbeda dari
 * checkRegistrationStatus() (publik, tanpa login, pakai nomor+tgl lahir) —
 * dipakai frontend untuk menyapa user dengan status pendaftarannya begitu
 * login, tanpa perlu mengetik ulang nomor pendaftaran.
 */
export async function getMyLatestRegistration(userId: number) {
  const { rows } = await pool.query(
    `SELECT r.registration_number, r.status, r.full_name, r.created_at, r.academic_year, r.admin_note, m.name AS major_name
     FROM ppdb_registrations r
     LEFT JOIN ppdb_majors m ON m.id = r.major_id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC
     LIMIT 1`,
    [userId],
  )
  const row = rows[0]
  if (!row) return null

  const status = row.status as RegistrationStatus
  return {
    registrationNumber: row.registration_number as string,
    status,
    statusLabel: STATUS_LABELS[status],
    fullName: row.full_name as string,
    academicYear: row.academic_year as string,
    majorName: (row.major_name as string | null) ?? null,
    submittedAt: row.created_at,
    note: status === 'perlu_revisi' || status === 'ditolak' ? (row.admin_note as string | null) : null,
  }
}

export async function checkRegistrationStatus(registrationNumber: string, birthDate: string) {
  const { rows } = await pool.query(
    `SELECT r.status, r.full_name, r.created_at, r.academic_year, r.admin_note, m.name AS major_name
     FROM ppdb_registrations r
     LEFT JOIN ppdb_majors m ON m.id = r.major_id
     WHERE r.registration_number = $1 AND r.birth_date = $2
     LIMIT 1`,
    [registrationNumber, birthDate],
  )
  const row = rows[0]
  if (!row) {
    throw notFound('Nomor pendaftaran atau tanggal lahir tidak cocok dengan data kami. Periksa kembali penulisannya.')
  }
  const status = row.status as RegistrationStatus
  return {
    registrationNumber,
    status,
    statusLabel: STATUS_LABELS[status],
    fullName: row.full_name as string,
    academicYear: row.academic_year as string,
    majorName: (row.major_name as string | null) ?? null,
    submittedAt: row.created_at,
    // Catatan admin hanya ditampilkan ke publik saat statusnya "perlu revisi"
    // — supaya jelas apa yang perlu diperbaiki tanpa membocorkan catatan
    // internal admin untuk status lain.
    note: status === 'perlu_revisi' ? (row.admin_note as string | null) : null,
  }
}

export interface ListRegistrationsParams {
  page: number
  pageSize: number
  status?: RegistrationStatus
  majorId?: number
  search?: string
}

function buildFilterClause(params: Omit<ListRegistrationsParams, 'page' | 'pageSize'>): { clause: string; values: unknown[] } {
  const conditions: string[] = []
  const values: unknown[] = []
  // Setiap nilai yang didaftarkan otomatis mendapat nomor placeholder berikutnya ($1, $2, ...).
  const ph = (value: unknown) => {
    values.push(value)
    return `$${values.length}`
  }

  if (params.status) {
    conditions.push(`r.status = ${ph(params.status)}`)
  }
  if (params.majorId) {
    conditions.push(`r.major_id = ${ph(params.majorId)}`)
  }
  if (params.search) {
    const term = params.search
    const like = `%${term}%`
    // ILIKE (bukan LIKE): LIKE di MySQL (collation utf8mb4_unicode_ci) tidak membedakan
    // huruf besar/kecil, sedangkan LIKE di PostgreSQL membedakan.
    if (/^\d{16}$/.test(term)) {
      // Bila teks pencarian persis 16 digit, ikutkan juga pencarian NIK
      // eksak lewat blind index (nik_hash) — NIK tidak bisa dicari via LIKE
      // karena tersimpan terenkripsi.
      conditions.push(
        `(r.nik_hash = ${ph(hashForLookup(term))} OR r.full_name ILIKE ${ph(like)} OR r.registration_number ILIKE ${ph(like)} OR r.nisn ILIKE ${ph(like)})`,
      )
    } else {
      conditions.push(
        `(r.full_name ILIKE ${ph(like)} OR r.registration_number ILIKE ${ph(like)} OR r.nisn ILIKE ${ph(like)})`,
      )
    }
  }

  return { clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '', values }
}

export async function listRegistrations(params: ListRegistrationsParams) {
  const { clause, values } = buildFilterClause(params)

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) AS total FROM ppdb_registrations r ${clause}`,
    values,
  )
  const total = Number(countRows[0]?.total ?? 0)
  const offset = (params.page - 1) * params.pageSize

  const { rows } = await pool.query(
    `SELECT r.id, r.registration_number, r.status, r.full_name, r.nisn, r.gender, r.phone, r.email,
            r.previous_school, r.academic_year, r.created_at, m.name AS major_name
     FROM ppdb_registrations r
     LEFT JOIN ppdb_majors m ON m.id = r.major_id
     ${clause}
     ORDER BY r.created_at DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, params.pageSize, offset],
  )

  return {
    items: rows.map((row) => ({
      id: row.id as number,
      registrationNumber: row.registration_number as string,
      status: row.status as RegistrationStatus,
      statusLabel: STATUS_LABELS[row.status as RegistrationStatus],
      fullName: row.full_name as string,
      nisn: row.nisn as string,
      gender: row.gender as 'L' | 'P',
      phone: row.phone as string,
      email: row.email as string,
      previousSchool: row.previous_school as string,
      majorName: (row.major_name as string | null) ?? null,
      academicYear: row.academic_year as string,
      submittedAt: row.created_at,
    })),
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
  }
}

export async function getRegistrationDetail(id: number) {
  const { rows } = await pool.query(
    `SELECT r.*, m.name AS major_name, va.name AS verified_by_name, sa.name AS sent_to_dinas_by_name
     FROM ppdb_registrations r
     LEFT JOIN ppdb_majors m ON m.id = r.major_id
     LEFT JOIN admins va ON va.id = r.verified_by
     LEFT JOIN admins sa ON sa.id = r.sent_to_dinas_by
     WHERE r.id = $1
     LIMIT 1`,
    [id],
  )
  const row = rows[0]
  if (!row) throw notFound(`Pendaftaran dengan id ${id} tidak ditemukan.`)

  const { rows: docRows } = await pool.query(
    `SELECT id, doc_type, original_filename, mime_type, size_bytes, uploaded_at
     FROM ppdb_documents WHERE registration_id = $1 ORDER BY doc_type ASC`,
    [id],
  )

  return {
    id: row.id as number,
    registrationNumber: row.registration_number as string,
    status: row.status as RegistrationStatus,
    statusLabel: STATUS_LABELS[row.status as RegistrationStatus],
    nik: decryptField(row.nik_encrypted as string),
    nisn: row.nisn as string,
    fullName: row.full_name as string,
    birthPlace: row.birth_place as string,
    birthDate: formatDateOnly(row.birth_date),
    gender: row.gender as 'L' | 'P',
    religion: row.religion as string,
    phone: row.phone as string,
    email: row.email as string,
    address: row.address as string,
    province: row.province as string,
    city: row.city as string,
    district: row.district as string,
    village: row.village as string,
    fatherName: row.father_name as string,
    fatherJob: row.father_job as string,
    fatherPhone: row.father_phone as string,
    motherName: row.mother_name as string,
    motherJob: row.mother_job as string,
    motherPhone: row.mother_phone as string,
    guardianName: row.guardian_name as string | null,
    guardianRelationship: row.guardian_relationship as string | null,
    guardianJob: row.guardian_job as string | null,
    guardianPhone: row.guardian_phone as string | null,
    majorId: row.major_id as number | null,
    majorName: (row.major_name as string | null) ?? null,
    academicYear: row.academic_year as string,
    previousSchool: row.previous_school as string,
    adminNote: row.admin_note as string | null,
    verifiedBy: (row.verified_by_name as string | null) ?? null,
    verifiedAt: row.verified_at,
    sentToDinasBy: (row.sent_to_dinas_by_name as string | null) ?? null,
    sentToDinasAt: row.sent_to_dinas_at,
    submittedIp: row.submitted_ip as string | null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    documents: docRows.map((d) => ({
      id: d.id as number,
      docType: d.doc_type as string,
      originalFilename: d.original_filename as string,
      mimeType: d.mime_type as string,
      sizeBytes: d.size_bytes as number,
      uploadedAt: d.uploaded_at,
    })),
  }
}

export async function updateRegistrationStatus(
  id: number,
  next: RegistrationStatus,
  note: string,
  admin: AuthenticatedAdmin,
) {
  const { rows } = await pool.query(
    'SELECT status, full_name, email, registration_number FROM ppdb_registrations WHERE id = $1 LIMIT 1',
    [id],
  )
  const existing = rows[0]
  const current = existing?.status as RegistrationStatus | undefined
  if (!current) throw notFound(`Pendaftaran dengan id ${id} tidak ditemukan.`)

  if (current !== next && !STATUS_TRANSITIONS[current].includes(next)) {
    throw conflict(`Status tidak bisa diubah dari "${STATUS_LABELS[current]}" langsung ke "${STATUS_LABELS[next]}".`)
  }

  const setParts = ['status = $1', 'admin_note = $2']
  const values: unknown[] = [next, note || null]

  if (next === 'diverifikasi') {
    values.push(admin.id)
    setParts.push(`verified_by = $${values.length}`, 'verified_at = NOW()')
  }
  if (next === 'terkirim_ke_dinas') {
    values.push(admin.id)
    setParts.push(`sent_to_dinas_by = $${values.length}`, 'sent_to_dinas_at = NOW()')
  }

  values.push(id)
  await pool.query(`UPDATE ppdb_registrations SET ${setParts.join(', ')} WHERE id = $${values.length}`, values)

  // Notifikasi email dikirim best-effort: kegagalan SMTP TIDAK menggagalkan
  // perubahan status itu sendiri (statusnya sudah tersimpan di atas) — admin
  // tetap melihat status baru di dashboard, hanya saja perlu tahu email
  // gagal terkirim. Dicatat ke console alih-alih dilempar supaya alur admin
  // tidak terhenti oleh masalah SMTP yang di luar kendalinya saat itu.
  if (current !== next && existing?.email) {
    const { subject, html } = buildPpdbStatusEmail(
      existing.full_name as string,
      existing.registration_number as string,
      STATUS_LABELS[next],
      next === 'perlu_revisi' || next === 'ditolak' ? note || null : null,
    )
    sendMail({ to: existing.email as string, subject, html }).catch((err) => {
      console.error('Gagal mengirim email notifikasi status PPDB:', err)
    })
  }

  return getRegistrationDetail(id)
}

export async function getRegistrationDocumentFile(registrationId: number, documentId: number) {
  const { rows } = await pool.query(
    `SELECT id, doc_type, original_filename, stored_filename, mime_type
     FROM ppdb_documents WHERE id = $1 AND registration_id = $2 LIMIT 1`,
    [documentId, registrationId],
  )
  const doc = rows[0]
  if (!doc) throw notFound('Dokumen tidak ditemukan.')

  const buffer = await readDocumentFile(registrationId, doc.stored_filename as string)
  return {
    buffer,
    mimeType: doc.mime_type as string,
    originalFilename: doc.original_filename as string,
  }
}

const CSV_HEADERS = [
  'Nomor Pendaftaran', 'Status', 'NIK', 'NISN', 'Nama Lengkap', 'Tempat Lahir', 'Tanggal Lahir', 'Jenis Kelamin',
  'Agama', 'No. HP/WhatsApp', 'Email',
  'Alamat', 'Provinsi', 'Kabupaten/Kota', 'Kecamatan', 'Kelurahan/Desa',
  'Nama Ayah', 'Pekerjaan Ayah', 'No. HP Ayah',
  'Nama Ibu', 'Pekerjaan Ibu', 'No. HP Ibu',
  'Nama Wali', 'Hubungan Wali', 'Pekerjaan Wali', 'No. HP Wali',
  'Jurusan/Peminatan', 'Tahun Ajaran', 'Asal Sekolah (SMP/MTs)', 'Waktu Mendaftar',
]

export async function exportRegistrationsCsv(
  params: Omit<ListRegistrationsParams, 'page' | 'pageSize'>,
): Promise<string> {
  const { clause, values } = buildFilterClause(params)
  const { rows } = await pool.query(
    `SELECT r.*, m.name AS major_name
     FROM ppdb_registrations r
     LEFT JOIN ppdb_majors m ON m.id = r.major_id
     ${clause}
     ORDER BY r.created_at ASC`,
    values,
  )

  const csvRows = rows.map((row) => [
    row.registration_number,
    STATUS_LABELS[row.status as RegistrationStatus],
    decryptField(row.nik_encrypted as string),
    row.nisn,
    row.full_name,
    row.birth_place,
    formatDateOnly(row.birth_date),
    GENDER_LABELS[row.gender as 'L' | 'P'],
    row.religion,
    row.phone,
    row.email,
    row.address,
    row.province,
    row.city,
    row.district,
    row.village,
    row.father_name,
    row.father_job,
    row.father_phone,
    row.mother_name,
    row.mother_job,
    row.mother_phone,
    row.guardian_name ?? '',
    row.guardian_relationship ?? '',
    row.guardian_job ?? '',
    row.guardian_phone ?? '',
    row.major_name ?? '',
    row.academic_year,
    row.previous_school,
    formatDateTime(row.created_at),
  ])

  return buildCsv(CSV_HEADERS, csvRows)
}
