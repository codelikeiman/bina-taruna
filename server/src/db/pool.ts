import fs from 'node:fs'
import { Pool, type PoolConfig } from 'pg'
import { env } from '../config/env'

/**
 * Memilih DATABASE_URL (dari Supabase Dashboard -> Connect):
 *  - Backend di server/VPS yang jalan terus  -> Direct connection (butuh IPv6 atau
 *    add-on IPv4), ATAU Session pooler (port 5432) bila jaringan hanya IPv4.
 *  - Serverless / edge / batas koneksi ketat -> Transaction pooler (port 6543) dan
 *    set DB_POOL_MAX=1. Transaction mode tidak mendukung prepared statement: kode
 *    ini aman karena pg hanya membuat prepared statement bila query diberi `name`
 *    (tidak ada yang begitu di sini) — jangan menambahkannya. Juga jangan memakai
 *    SET / advisory lock / LISTEN yang bergantung pada sesi.
 *  - "npm run db:migrate" sebaiknya lewat Direct connection atau Session pooler.
 */
function buildSsl(): PoolConfig['ssl'] {
  if (!env.DB_SSL) return false
  // Verifikasi penuh bila Root Certificate disediakan.
  if (env.DB_SSL_CA) return { ca: fs.readFileSync(env.DB_SSL_CA, 'utf8') }
  // Terenkripsi tetapi server tidak diverifikasi (setara sslmode=require).
  return { rejectUnauthorized: false }
}

/** Dipakai bersama oleh pool aplikasi dan migrate.ts agar konfigurasi koneksi tidak bercabang. */
export const dbConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  ssl: buildSsl(),
}

export const pool = new Pool({
  ...dbConfig,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: 60_000,
  // Gagal cepat (dan jelas) bila host tidak terjangkau, mis. direct connection
  // Supabase dari jaringan yang hanya IPv4.
  connectionTimeoutMillis: 10_000,
})

// Tanpa listener ini, koneksi idle yang diputus pooler/jaringan memunculkan event
// 'error' yang tak tertangani dan MEMATIKAN proses Node. pg membuang koneksi
// bermasalah itu dari pool sendiri, jadi cukup dicatat.
pool.on('error', (err) => {
  console.error('Koneksi database idle bermasalah (akan dibuka ulang otomatis):', err.message)
})

/** Quick connectivity check used at boot so failures are loud and immediate. */
export async function assertDbConnection(): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query('SELECT 1')
  } finally {
    client.release()
  }
}
