import { randomBytes } from 'node:crypto'
import multer from 'multer'
import { env } from '../../config/env'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import { badRequest } from '../../utils/httpError'

/** multer memoryStorage — berkas divalidasi (magic bytes) dulu sebelum diunggah ke Supabase Storage. */
export const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.PHOTO_MAX_UPLOAD_MB * 1024 * 1024,
    files: 1,
  },
}).single('photo')

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const WEBP_RIFF = Buffer.from('RIFF', 'ascii')
const WEBP_MARKER = Buffer.from('WEBP', 'ascii')
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/**
 * Mendeteksi tipe berkas dari byte pertama isinya (magic bytes), bukan dari
 * ekstensi nama file atau Content-Type yang dikirim browser — sama seperti
 * pola di modules/ppdb/ppdb.documents.ts, supaya nama berkas yang dipalsukan
 * (mis. .html diganti nama jadi .jpg) tidak lolos.
 */
function detectImageMimeType(buffer: Buffer): string | undefined {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }
  if (buffer.length >= PNG_SIGNATURE.length && buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    return 'image/png'
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).equals(WEBP_RIFF) &&
    buffer.subarray(8, 12).equals(WEBP_MARKER)
  ) {
    return 'image/webp'
  }
  return undefined
}

export interface SavedPhoto {
  /** URL publik penuh dari Supabase Storage — disimpan langsung sebagai photo_url. */
  url: string
}

/**
 * Memvalidasi lalu mengunggah satu foto yang diunggah admin ke bucket publik
 * Supabase Storage (env.PHOTO_BUCKET). Nama file ditulis acak (bukan nama
 * asli), konsisten dengan pola penamaan berkas PPDB — mencegah nama berkas
 * menebak isi atau bentrok antar unggahan.
 */
export async function validateAndSavePhoto(file: Express.Multer.File | undefined): Promise<SavedPhoto> {
  if (!file) {
    throw badRequest('Berkas foto wajib diunggah.')
  }

  const detectedMime = detectImageMimeType(file.buffer)
  if (!detectedMime) {
    throw badRequest('Foto harus berformat JPG, PNG, atau WEBP dan tidak boleh rusak.')
  }

  const extension = EXTENSION_BY_MIME[detectedMime]
  const filename = `${randomBytes(16).toString('hex')}.${extension}`

  const { error } = await supabaseAdmin.storage.from(env.PHOTO_BUCKET).upload(filename, file.buffer, {
    contentType: detectedMime,
    cacheControl: '604800', // 7 hari, sama seperti maxAge lama
    upsert: false,
  })
  if (error) {
    throw badRequest(`Gagal mengunggah foto ke penyimpanan: ${error.message}`)
  }

  const { data } = supabaseAdmin.storage.from(env.PHOTO_BUCKET).getPublicUrl(filename)
  return { url: data.publicUrl }
}

/**
 * Menghapus satu berkas foto berdasarkan photo_url yang tersimpan di DB
 * (mis. saat admin mengganti foto atau menghapus item). Hanya nama berkas
 * (bagian akhir URL) yang dipakai untuk menghapus dari bucket — mengabaikan
 * URL yang bukan berasal dari bucket ini (mis. data lama/format lain).
 */
export async function deletePhotoByUrl(photoUrl: string | null | undefined): Promise<void> {
  if (!photoUrl) return
  if (!photoUrl.includes(`/${env.PHOTO_BUCKET}/`)) return
  const filename = photoUrl.split('/').pop()
  if (!filename) return
  await supabaseAdmin.storage.from(env.PHOTO_BUCKET).remove([filename])
}
