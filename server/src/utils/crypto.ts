import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes } from 'node:crypto'
import { env } from '../config/env'

/**
 * Enkripsi field sensitif tingkat-kolom (dipakai untuk NIK di modul PPDB).
 *
 * NIK adalah nomor identitas kependudukan yang sifatnya setara data pribadi
 * spesifik/sensitif — kita TIDAK bisa menyimpannya sebagai hash satu-arah
 * karena sekolah tetap perlu mengirim NIK asli ke dinas pendidikan. Karena
 * itu dipakai enkripsi simetris (AES-256-GCM, authenticated encryption)
 * alih-alih hash, dengan kunci dari ENCRYPTION_KEY (lihat config/env.ts).
 *
 * Untuk keperluan cek duplikat/pencarian tanpa mendekripsi seluruh baris,
 * disediakan pula hashForLookup() — HMAC-SHA256 "blind index" yang
 * deterministik (nilai sama -> hash sama) tapi tidak bisa dibalik ke NIK asli.
 *
 * Kunci enkripsi & kunci HMAC diturunkan dari SATU ENCRYPTION_KEY memakai
 * HKDF dengan "info" berbeda (domain separation), supaya operator hanya
 * perlu menyimpan & mem-backup satu rahasia, bukan dua.
 *
 * PENTING: jika ENCRYPTION_KEY hilang/berubah, seluruh nik_encrypted yang
 * sudah tersimpan TIDAK BISA didekripsi lagi. Backup nilai ini seaman
 * JWT_SECRET / password database — lihat catatan di server/.env.example.
 */

const masterKey = Buffer.from(env.ENCRYPTION_KEY, 'base64')

function deriveKey(info: string): Buffer {
  return Buffer.from(hkdfSync('sha256', masterKey, Buffer.alloc(0), Buffer.from(info), 32))
}

const encKey = deriveKey('ppdb-field-encryption-v1')
const hmacKey = deriveKey('ppdb-field-hmac-v1')

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

/** Mengenkripsi plaintext, mengembalikan string `${iv}.${authTag}.${ciphertext}` (base64). */
export function encryptField(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, encKey, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('base64')}.${authTag.toString('base64')}.${ciphertext.toString('base64')}`
}

/** Mendekripsi string hasil encryptField(). Melempar error bila format/kunci tidak cocok. */
export function decryptField(stored: string): string {
  const parts = stored.split('.')
  if (parts.length !== 3) {
    throw new Error('Format data terenkripsi tidak valid.')
  }
  const [ivB64, authTagB64, ciphertextB64] = parts
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')
  const ciphertext = Buffer.from(ciphertextB64, 'base64')

  const decipher = createDecipheriv(ALGORITHM, encKey, iv)
  decipher.setAuthTag(authTag)
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return plaintext.toString('utf8')
}

/**
 * Hash deterministik untuk pencarian/cek-duplikat (mis. WHERE nik_hash = ?)
 * tanpa perlu mendekripsi seluruh tabel. HMAC (bukan SHA256 polos) supaya
 * tidak bisa disusun ulang lewat rainbow table oleh siapa pun yang hanya
 * punya akses baca database tapi tidak punya ENCRYPTION_KEY.
 */
export function hashForLookup(value: string): string {
  return createHmac('sha256', hmacKey).update(value, 'utf8').digest('hex')
}
