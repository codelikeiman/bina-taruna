/**
 * Migrasi SATU KALI PAKAI: memindahkan berkas yang sudah ada di
 * server/uploads/ (disk lokal, format lama) ke Supabase Storage, lalu
 * memperbarui kolom photo_url/image_url di database supaya menunjuk ke URL
 * Supabase yang baru.
 *
 * Jalankan SEKALI, SEBELUM deploy ke Vercel, dari folder server/:
 *   1. Isi SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY di .env
 *   2. Buat bucket "photos" (public) dan "ppdb-documents" (private) di
 *      Supabase Dashboard -> Storage
 *   3. npx tsx scripts/migrate-uploads-to-supabase.ts
 *   4. Setelah sukses & sudah dicek manual, folder server/uploads/ boleh
 *      dihapus — sudah tidak dipakai kode manapun lagi.
 *
 * Aman dijalankan berkali-kali (idempotent): berkas yang sudah pernah
 * diunggah otomatis dilewati (upsert: true di sini, berbeda dari kode
 * aplikasi yang sengaja upsert:false untuk unggahan baru).
 */
import { promises as fsp } from 'node:fs'
import path from 'node:path'
import { env } from '../src/config/env'
import { pool } from '../src/db/pool'
import { supabaseAdmin } from '../src/lib/supabaseAdmin'

const UPLOADS_ROOT = path.resolve(__dirname, '../uploads')
const PHOTOS_DIR = path.join(UPLOADS_ROOT, 'photos')
const PPDB_DIR = path.join(UPLOADS_ROOT, 'ppdb')

const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
}

const PHOTO_URL_COLUMNS: Array<{ table: string; column: string }> = [
  { table: 'achievements', column: 'photo_url' },
  { table: 'leadership', column: 'photo_url' },
  { table: 'teachers', column: 'photo_url' },
  { table: 'gallery', column: 'photo_url' },
  { table: 'extracurriculars', column: 'image_url' },
]

async function dirExists(dir: string): Promise<boolean> {
  try {
    return (await fsp.stat(dir)).isDirectory()
  } catch {
    return false
  }
}

function mimeFor(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSION_TO_MIME[ext] ?? 'application/octet-stream'
}

async function migratePhotos() {
  if (!(await dirExists(PHOTOS_DIR))) {
    console.log('  (tidak ada server/uploads/photos/ — dilewati)')
    return
  }

  const files = (await fsp.readdir(PHOTOS_DIR)).filter((f) => !f.startsWith('.'))
  console.log(`  Ditemukan ${files.length} foto di disk lokal.`)

  for (const filename of files) {
    const buffer = await fsp.readFile(path.join(PHOTOS_DIR, filename))
    const { error: uploadError } = await supabaseAdmin.storage
      .from(env.PHOTO_BUCKET)
      .upload(filename, buffer, { contentType: mimeFor(filename), upsert: true })
    if (uploadError) {
      console.error(`  ❌ Gagal unggah ${filename}: ${uploadError.message}`)
      continue
    }

    const { data } = supabaseAdmin.storage.from(env.PHOTO_BUCKET).getPublicUrl(filename)
    const oldRelativePath = `/uploads/photos/${filename}`

    let updatedRows = 0
    for (const { table, column } of PHOTO_URL_COLUMNS) {
      const result = await pool.query(
        `UPDATE ${table} SET ${column} = $1 WHERE ${column} = $2`,
        [data.publicUrl, oldRelativePath],
      )
      updatedRows += result.rowCount ?? 0
    }

    console.log(`  ✔ ${filename} -> ${data.publicUrl} (${updatedRows} baris DB diperbarui)`)
  }
}

async function migratePpdbDocuments() {
  if (!(await dirExists(PPDB_DIR))) {
    console.log('  (tidak ada server/uploads/ppdb/ — dilewati)')
    return
  }

  const registrationDirs = (await fsp.readdir(PPDB_DIR)).filter((f) => !f.startsWith('.'))
  console.log(`  Ditemukan ${registrationDirs.length} folder pendaftaran PPDB.`)

  for (const registrationId of registrationDirs) {
    const dir = path.join(PPDB_DIR, registrationId)
    if (!(await dirExists(dir))) continue

    const files = (await fsp.readdir(dir)).filter((f) => !f.startsWith('.'))
    for (const filename of files) {
      const buffer = await fsp.readFile(path.join(dir, filename))
      const objectPath = `${registrationId}/${filename}`
      const { error } = await supabaseAdmin.storage
        .from(env.PPDB_BUCKET)
        .upload(objectPath, buffer, { contentType: mimeFor(filename), upsert: true })
      if (error) {
        console.error(`  ❌ Gagal unggah ${objectPath}: ${error.message}`)
        continue
      }
      console.log(`  ✔ ${objectPath} (bucket privat, tidak perlu update DB — stored_filename sudah cocok)`)
    }
  }
}

async function main() {
  console.log('=== Migrasi foto publik ===')
  await migratePhotos()

  console.log('\n=== Migrasi dokumen PPDB ===')
  await migratePpdbDocuments()

  console.log('\nSelesai. Cek beberapa foto/dokumen di Supabase Dashboard -> Storage sebelum menghapus server/uploads/.')
  await pool.end()
}

main().catch((err) => {
  console.error('Migrasi gagal:', err)
  process.exit(1)
})
