/**
 * Menjalankan schema.sql lalu seed-content.sql terhadap database yang
 * dikonfigurasi di .env (DATABASE_URL). Aman dijalankan berulang kali:
 * schema.sql hanya memakai CREATE TABLE/INDEX IF NOT EXISTS, ADD COLUMN IF NOT
 * EXISTS, dan blok DO yang mengecek dulu, sedangkan setiap blok di
 * seed-content.sql menghapus isi tabel sebelum mengisi ulang. Tabel `admins`
 * tidak disentuh di sini — gunakan `npm run db:seed-admin` untuk itu.
 *
 * PERHATIAN: karena seed-content.sql mengosongkan tabel konten dulu, JANGAN
 * menjalankan ulang perintah ini pada database yang sudah berisi konten asli
 * (termasuk photo_url hasil unggahan) — isinya akan tertimpa data contoh.
 *
 * Jalankan lewat: npm run db:migrate
 */
import fs from 'node:fs'
import path from 'node:path'
import { Client } from 'pg'
import { dbConfig } from './pool'

async function run() {
  // Koneksi sekali-pakai. Query TANPA parameter memakai "simple query protocol"
  // PostgreSQL, yang boleh berisi banyak statement sekaligus dan menjalankannya
  // dalam satu transaksi implisit (bila satu statement gagal, seluruh file
  // dibatalkan — tidak ada skema setengah jadi). Isi file .sql sepenuhnya kita
  // kendalikan sendiri (bukan input pengguna).
  const client = new Client(dbConfig)
  await client.connect()

  try {
    const schemaPath = path.join(__dirname, '..', '..', 'db', 'schema.sql')
    const seedPath = path.join(__dirname, '..', '..', 'db', 'seed-content.sql')

    console.log('▶ Menjalankan schema.sql ...')
    await client.query(fs.readFileSync(schemaPath, 'utf8'))
    console.log('✔ Skema tabel siap.')

    console.log('▶ Menjalankan seed-content.sql ...')
    await client.query(fs.readFileSync(seedPath, 'utf8'))
    console.log('✔ Konten contoh berhasil dimuat.')

    console.log('\nSelesai. Jalankan "npm run db:seed-admin" untuk membuat akun admin pertama.')
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('❌ Migrasi gagal:', err)
  process.exit(1)
})
