/**
 * Membuat (atau memperbarui password) satu akun admin dashboard.
 *
 * Pemakaian:
 *   npm run db:seed-admin
 *   npm run db:seed-admin -- --email=kepsek@smabinataruna.sch.id --password="RahasiaKuat123" --name="Kepala Sekolah"
 *
 * Kalau --email/--password tidak diberikan, script memakai ADMIN_EMAIL /
 * ADMIN_PASSWORD / ADMIN_NAME dari .env, atau nilai contoh di bawah sebagai
 * pilihan terakhir. SELALU ganti password contoh ini sebelum situs live.
 */
import bcrypt from 'bcryptjs'
import { pool } from './pool'

function readArg(flag: string): string | undefined {
  const prefix = `--${flag}=`
  const found = process.argv.find((a) => a.startsWith(prefix))
  return found ? found.slice(prefix.length) : undefined
}

async function run() {
  const email = readArg('email') ?? process.env.ADMIN_EMAIL ?? 'admin@smabinataruna.sch.id'
  const password = readArg('password') ?? process.env.ADMIN_PASSWORD ?? 'GantiSegera#2026'
  const name = readArg('name') ?? process.env.ADMIN_NAME ?? 'Administrator'

  if (password.length < 8) {
    throw new Error('Password admin minimal 8 karakter.')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await pool.query(
    `INSERT INTO admins (name, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash`,
    [name, email, passwordHash],
  )

  console.log('✔ Akun admin siap dipakai:')
  console.log(`   Email    : ${email}`)
  console.log(`   Password : ${password}`)
  console.log('\n⚠  Segera login lalu ganti password lewat dashboard — jangan pakai password contoh ini di situs live.')

  await pool.end()
}

run().catch((err) => {
  console.error('❌ Gagal membuat akun admin:', err)
  process.exit(1)
})
