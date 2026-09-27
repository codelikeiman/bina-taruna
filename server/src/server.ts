import { createApp } from './app'
import { env } from './config/env'
import { assertDbConnection, pool } from './db/pool'

/**
 * Entry point untuk development lokal & deployment non-serverless (VPS,
 * Docker, dst.) — proses Node yang tetap nyala dan listen di satu port.
 * Untuk Vercel, lihat api/index.ts: app yang sama diekspor langsung tanpa
 * app.listen(), karena Vercel yang mengatur lifecycle request/response.
 */
async function main() {
  try {
    await assertDbConnection()
    console.log('✔ Koneksi database berhasil.')
  } catch (err) {
    console.error('❌ Tidak bisa terhubung ke database. Periksa server/.env (DATABASE_URL, DB_SSL).')
    console.error(err)
    process.exit(1)
  }

  const app = createApp()
  const server = app.listen(env.PORT, () => {
    console.log(`✔ API berjalan di http://localhost:${env.PORT}`)
    console.log(`  Frontend diizinkan dari: ${env.FRONTEND_ORIGIN}`)
  })

  const shutdown = (signal: string) => {
    console.log(`\n${signal} diterima, mematikan server...`)
    server.close(async () => {
      await pool.end()
      process.exit(0)
    })
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main()
