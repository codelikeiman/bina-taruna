import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  // --- Database (PostgreSQL / Supabase) ---
  // Connection string dari Supabase Dashboard -> tombol "Connect". Password
  // yang mengandung karakter khusus (#, &, ?, @, /, spasi) WAJIB di-percent-
  // encode (mis. # -> %23). JANGAN menambahkan ?sslmode=... di sini: di driver
  // pg 8.x nilai itu menimpa opsi ssl di kode, dan "require" diperlakukan
  // seperti "verify-full" (gagal karena CA Supabase tidak ada di trust store
  // Node). SSL diatur lewat DB_SSL / DB_SSL_CA di bawah.
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL wajib diisi.')
    .refine((value) => !/[?&]sslmode=/i.test(value), {
      message: 'Hapus parameter sslmode dari DATABASE_URL — SSL diatur lewat DB_SSL dan DB_SSL_CA.',
    }),
  // Batas koneksi di pool APLIKASI ini (bukan di pooler Supabase). Default 10
  // = connectionLimit lama. Di serverless / Transaction pooler isi 1
  // (lihat catatan di src/db/pool.ts).
  DB_POOL_MAX: z.coerce.number().int().positive().max(100).default(10),
  // true = koneksi dienkripsi SSL (wajib untuk Supabase). false = tanpa SSL,
  // hanya untuk PostgreSQL lokal.
  DB_SSL: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
  // Opsional: path (relatif terhadap folder server/) ke Root Certificate dari
  // Supabase Dashboard -> Database Settings -> SSL Configuration. Diisi =
  // server diverifikasi penuh (setara verify-full). Kosong = terenkripsi tanpa
  // verifikasi server (setara sslmode=require di docs Supabase).
  DB_SSL_CA: z.string().optional(),

  // --- Supabase Storage (foto publik & dokumen PPDB) ---
  // Ambil dari Supabase Dashboard -> Project Settings -> API.
  // SUPABASE_URL: https://<project-ref>.supabase.co (bukan connection string DB).
  SUPABASE_URL: z.string().url('SUPABASE_URL wajib berupa URL, mis. https://xxxx.supabase.co'),
  // service_role key (BUKAN anon key) — server butuh akses tulis ke bucket privat
  // ppdb-documents. JANGAN PERNAH kirim key ini ke frontend/browser.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY wajib diisi.'),
  // Nama bucket. Buat dulu di Supabase Dashboard -> Storage sebelum deploy:
  //   - photos       -> Public bucket (foto konten publik, mis. "Wajah-Wajah Juara")
  //   - ppdb-documents -> Private bucket (KK/akta/ijazah/pas foto pendaftar PPDB)
  PHOTO_BUCKET: z.string().min(1).default('photos'),
  PPDB_BUCKET: z.string().min(1).default('ppdb-documents'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET harus berisi minimal 16 karakter'),
  JWT_EXPIRES_IN: z.string().default('12h'),

  // Token login untuk akun pengguna publik (calon siswa/orang tua) — SENGAJA
  // dipisah dari JWT_SECRET admin, supaya kebocoran salah satu secret tidak
  // otomatis membuka jalan untuk memalsukan token peran yang lain.
  USER_JWT_SECRET: z.string().min(16, 'USER_JWT_SECRET harus berisi minimal 16 karakter'),
  USER_JWT_EXPIRES_IN: z.string().default('7d'),

  // --- Email (Nodemailer) ---
  // Dipakai untuk mengirim kode verifikasi akun & notifikasi status PPDB.
  // Contoh Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_SECURE=false,
  // SMTP_USER=alamat@gmail.com, SMTP_PASSWORD=App Password (bukan password akun biasa).
  SMTP_HOST: z.string().min(1, 'SMTP_HOST wajib diisi.'),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  SMTP_USER: z.string().min(1, 'SMTP_USER wajib diisi.'),
  SMTP_PASSWORD: z.string().min(1, 'SMTP_PASSWORD wajib diisi.'),
  // Alamat "From" pada email terkirim, mis. "SMA Bina Taruna <no-reply@smabinataruna.sch.id>".
  SMTP_FROM: z.string().min(1, 'SMTP_FROM wajib diisi.'),

  // Bisa berisi satu atau beberapa URL dipisah koma (lihat app.ts, yang
  // memisahnya dengan .split(',') untuk konfigurasi CORS). Setiap bagian
  // divalidasi sebagai URL agar salah ketik terdeteksi saat boot, bukan
  // saat request CORS pertama gagal secara membingungkan di production.
  FRONTEND_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .refine(
      (value) => value.split(',').every((part) => z.string().url().safeParse(part.trim()).success),
      { message: 'Harus berupa satu atau beberapa URL valid dipisah koma, mis. http://localhost:5173,https://example.com' },
    ),

  // --- Modul PPDB ---
  // Kunci enkripsi kolom NIK (lihat src/utils/crypto.ts). Wajib base64 yang
  // mem-decode menjadi TEPAT 32 byte (AES-256). Contoh membuatnya:
  //   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  // PENTING: kehilangan/mengganti nilai ini membuat seluruh NIK pendaftar
  // yang sudah tersimpan tidak bisa didekripsi lagi — backup seaman JWT_SECRET.
  ENCRYPTION_KEY: z
    .string()
    .min(1, 'ENCRYPTION_KEY wajib diisi.')
    .refine(
      (value) => {
        try {
          return Buffer.from(value, 'base64').length === 32
        } catch {
          return false
        }
      },
      {
        message:
          'ENCRYPTION_KEY harus berupa base64 yang mem-decode menjadi tepat 32 byte. Contoh membuatnya: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"',
      },
    ),

  // Batas ukuran per berkas dokumen PPDB, dalam MB.
  PPDB_MAX_UPLOAD_MB: z.coerce.number().int().positive().max(20).default(2),

  // Batas ukuran per berkas foto konten publik, dalam MB.
  PHOTO_MAX_UPLOAD_MB: z.coerce.number().int().positive().max(20).default(3),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Konfigurasi .env tidak valid:')
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`)
  }
  console.error('\nSalin server/.env.example menjadi server/.env lalu sesuaikan nilainya.')
  process.exit(1)
}

export const env = parsed.data
