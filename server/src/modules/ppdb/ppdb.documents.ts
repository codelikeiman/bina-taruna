import { randomBytes } from 'node:crypto'
import multer from 'multer'
import { env } from '../../config/env'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import { badRequest } from '../../utils/httpError'
import { DOCUMENT_LABELS, DOCUMENT_TYPES, type DocumentType } from './ppdb.types'

/** Tipe MIME yang diterima per jenis dokumen, ditentukan dari isi berkas (magic bytes), bukan dari nama/ekstensi. */
const ALLOWED_MIME_TYPES: Record<DocumentType, readonly string[]> = {
  kk: ['image/jpeg', 'image/png', 'application/pdf'],
  akta: ['image/jpeg', 'image/png', 'application/pdf'],
  ijazah: ['image/jpeg', 'image/png', 'application/pdf'],
  // Pas foto harus benar-benar foto, bukan hasil scan dokumen PDF.
  foto: ['image/jpeg', 'image/png'],
}

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
}

/**
 * multer dikonfigurasi dengan memoryStorage — berkas SEMENTARA hanya ada
 * di RAM sebagai Buffer, belum ditulis ke disk sama sekali. Ini penting:
 * validasi magic-bytes (validateDocumentFiles) harus lolos dulu sebelum
 * satu byte pun disimpan ke disk, jadi berkas tidak tepercaya tidak pernah
 * menyentuh filesystem walau sebentar.
 */
export const ppdbUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.PPDB_MAX_UPLOAD_MB * 1024 * 1024,
    files: DOCUMENT_TYPES.length,
  },
}).fields(DOCUMENT_TYPES.map((name) => ({ name, maxCount: 1 })))

export type UploadedFiles = Partial<Record<DocumentType, Express.Multer.File[]>>

export interface ValidatedDocument {
  docType: DocumentType
  buffer: Buffer
  originalFilename: string
  mimeType: string
  extension: string
  sizeBytes: number
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const PDF_SIGNATURE = Buffer.from('%PDF-', 'ascii')

/**
 * Mendeteksi tipe berkas dari byte pertama isinya (magic bytes / file
 * signature), BUKAN dari ekstensi nama file atau header Content-Type yang
 * dikirim browser — keduanya gampang dipalsukan (mis. mengganti nama
 * berkas .html jadi .jpg).
 *
 * Sengaja diimplementasikan manual, bukan lewat pustaka umum seperti
 * `file-type`: kita hanya perlu mengenali TEPAT 3 format (JPEG, PNG, PDF),
 * dan versi CJS `file-type` yang kompatibel dengan setup TypeScript proyek
 * ini (16.5.4) diketahui punya celah infinite-loop pada parser format LAIN
 * yang sama sekali tidak kita pakai (ASF/WMA — GHSA-5v7r-6r5c-r473). Karena
 * ini endpoint publik tanpa autentikasi (rawan disalahgunakan), lebih aman
 * tidak menyertakan kode parser untuk puluhan format yang tidak diperlukan
 * daripada bergantung pada pustaka luar untuk hal yang bisa dicek sendiri
 * dengan beberapa baris kode dan tanpa dependency tambahan.
 */
function detectMimeType(buffer: Buffer): string | undefined {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }
  if (buffer.length >= PNG_SIGNATURE.length && buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    return 'image/png'
  }
  // Spesifikasi PDF mengizinkan sedikit byte tambahan sebelum header %PDF-
  // (mis. BOM dari sebagian tool scan/ekspor) — dicek dalam 1024 byte
  // pertama, bukan hanya persis di posisi 0, supaya PDF valid dari sumber
  // semacam itu tidak salah ditolak.
  if (buffer.subarray(0, Math.min(buffer.length, 1024)).includes(PDF_SIGNATURE)) {
    return 'application/pdf'
  }
  return undefined
}

/**
 * Memeriksa kelengkapan & keaslian tipe tiap berkas yang diunggah. Melempar
 * badRequest() dengan pesan yang jelas bila ada berkas hilang atau tipenya
 * tidak sesuai daftar yang diizinkan untuk slot dokumen tersebut.
 */
export async function validateDocumentFiles(files: UploadedFiles): Promise<ValidatedDocument[]> {
  const results: ValidatedDocument[] = []

  for (const docType of DOCUMENT_TYPES) {
    const uploaded = files[docType]?.[0]
    if (!uploaded) {
      throw badRequest(`Dokumen ${DOCUMENT_LABELS[docType]} wajib diunggah.`)
    }

    const detectedMime = detectMimeType(uploaded.buffer)
    const allowed = ALLOWED_MIME_TYPES[docType]

    if (!detectedMime || !allowed.includes(detectedMime)) {
      const allowedLabel = allowed.includes('application/pdf') ? 'JPG, PNG, atau PDF' : 'JPG atau PNG'
      throw badRequest(
        `Dokumen ${DOCUMENT_LABELS[docType]} harus berformat ${allowedLabel} dan tidak boleh rusak. ` +
          `Berkas yang diunggah tidak dikenali sebagai format tersebut.`,
      )
    }

    results.push({
      docType,
      buffer: uploaded.buffer,
      originalFilename: uploaded.originalname,
      mimeType: detectedMime,
      extension: EXTENSION_BY_MIME[detectedMime] ?? 'bin',
      sizeBytes: uploaded.buffer.length,
    })
  }

  return results
}

/**
 * Path objek di bucket privat Supabase Storage (env.PPDB_BUCKET) untuk satu
 * berkas pendaftaran — dikelompokkan per-registrationId, sama seperti
 * struktur folder disk lama, supaya deleteRegistrationFiles bisa menghapus
 * seluruh dokumen satu pendaftaran sekaligus lewat prefix ini.
 */
function objectPath(registrationId: number, storedFilename: string): string {
  return `${registrationId}/${storedFilename}`
}

/**
 * Mengunggah berkas yang sudah divalidasi ke bucket PRIVAT Supabase Storage,
 * dengan nama acak (bukan nama asli) supaya nama berkas tidak bisa ditebak.
 * Bucket ini tidak publik — satu-satunya jalan membaca berkas adalah lewat
 * readDocumentFile() di bawah, yang dipanggil dari endpoint admin
 * terautentikasi (lihat ppdb.admin.router.ts).
 */
export async function saveDocumentFiles(
  registrationId: number,
  files: ValidatedDocument[],
): Promise<Array<ValidatedDocument & { storedFilename: string }>> {
  const saved: Array<ValidatedDocument & { storedFilename: string }> = []
  for (const file of files) {
    const storedFilename = `${file.docType}-${randomBytes(16).toString('hex')}.${file.extension}`
    const { error } = await supabaseAdmin.storage
      .from(env.PPDB_BUCKET)
      .upload(objectPath(registrationId, storedFilename), file.buffer, {
        contentType: file.mimeType,
        upsert: false,
      })
    if (error) {
      throw badRequest(`Gagal mengunggah dokumen ${DOCUMENT_LABELS[file.docType]}: ${error.message}`)
    }
    saved.push({ ...file, storedFilename })
  }
  return saved
}

/** Mengunduh kembali isi berkas dari bucket privat untuk dikirim oleh endpoint admin. */
export async function readDocumentFile(registrationId: number, storedFilename: string): Promise<Buffer> {
  const { data, error } = await supabaseAdmin.storage
    .from(env.PPDB_BUCKET)
    .download(objectPath(registrationId, storedFilename))
  if (error || !data) {
    throw badRequest(`Gagal mengambil berkas dari penyimpanan: ${error?.message ?? 'tidak ditemukan'}`)
  }
  return Buffer.from(await data.arrayBuffer())
}

/**
 * Menghapus seluruh berkas satu pendaftaran dari bucket privat. Dipakai untuk
 * membersihkan berkas yatim bila proses penyimpanan gagal di tengah jalan
 * (lihat cleanupFailedRegistration di ppdb.registrations.service.ts) — bukan
 * untuk penghapusan pendaftaran biasa oleh admin.
 */
export async function deleteRegistrationFiles(registrationId: number): Promise<void> {
  const { data: files, error: listError } = await supabaseAdmin.storage
    .from(env.PPDB_BUCKET)
    .list(String(registrationId))
  if (listError || !files || files.length === 0) return

  const paths = files.map((f) => objectPath(registrationId, f.name))
  await supabaseAdmin.storage.from(env.PPDB_BUCKET).remove(paths)
}
