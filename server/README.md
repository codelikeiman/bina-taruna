# Backend API — SMA Bina Taruna

API (Express + TypeScript + PostgreSQL/Supabase) yang menyimpan seluruh konten situs
company profile SMA Bina Taruna dan melayani dashboard admin (`../admin/`)
serta situs publik (`../`).

> Petunjuk lengkap menjalankan proyek ini bersama dashboard admin dan situs
> publiknya ada di **README di folder root** (`../README.md`). Dokumen ini
> hanya mencakup detail yang spesifik untuk backend.

## Menjalankan

```bash
npm install
cp .env.example .env
```

Edit `.env` — isi `DATABASE_URL` dari Supabase Dashboard (tombol **Connect**),
`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` dari **Project Settings → API**,
dan buat `JWT_SECRET`/`USER_JWT_SECRET`/`ENCRYPTION_KEY` acak (perintah
contoh ada di dalam `.env.example`), lalu isi kredensial SMTP (lihat bagian
"Login PPDB & Email Verifikasi" di bawah). Bila password Supabase mengandung
tanda pagar (`#`), bungkus dengan tanda kutip dua, atau nilainya akan
terpotong diam-diam — lihat komentar di `.env.example`.

Buat dulu 2 bucket di Supabase Dashboard → Storage: `photos` (public) dan
`ppdb-documents` (private) — lihat detail lengkap di README root, bagian
"Persiapan Supabase".

```bash
npm run db:migrate
npm run db:seed-admin -- --email="admin@sekolah.sch.id" --password="PasswordKuat123" --name="Admin"
npm run dev
```

Server siap di `http://localhost:4000`. Cek dengan membuka
`http://localhost:4000/api/health`.

## Login PPDB & Email Verifikasi

Sebelum mengisi formulir PPDB, calon siswa/orang tua harus punya akun
terverifikasi. Alurnya:

1. **Daftar** — `POST /api/users/register` (nama, email, password). Akun
   dibuat dengan status `pending_admin_approval`. Belum ada email terkirim.
2. **Admin menyetujui** — dari dashboard admin, menu **PPDB → Akun
   Pengguna**, klik "Setujui & Kirim Kode". Ini men-generate kode 6-digit,
   menyimpan hash-nya (bukan kode polos) ke database, lalu mengirim kode
   asli ke email user lewat Nodemailer. Status akun berubah menjadi
   `pending_verification`.
3. **User verifikasi** — `POST /api/users/verify` (email + kode 6-digit,
   berlaku 30 menit). Berhasil → status `verified`.
4. **User login** — `POST /api/users/login` → token JWT terpisah dari token
   admin (secret `USER_JWT_SECRET`). Token ini dipakai untuk
   `POST /api/ppdb-registrations` (submit formulir PPDB, sekarang WAJIB
   login) lewat header `Authorization: Bearer <token>`.

Bila pendaftaran PPDB seorang user berstatus **ditolak**, ia boleh mengisi
formulir baru (attempt kedua) — akun tidak diblokir permanen. Setiap kali
admin mengubah status pendaftaran (termasuk menolak), email notifikasi
otomatis terkirim ke user berisi status terbaru & catatan admin bila ada.

**Konfigurasi SMTP** (wajib diisi di `.env`, lihat `.env.example`):
`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`,
`SMTP_FROM`. Untuk Gmail, gunakan
[App Password](https://myaccount.google.com/apppasswords) (butuh 2FA aktif),
bukan password akun biasa. Tanpa SMTP yang valid, tombol "Setujui & Kirim
Kode" di dashboard admin akan gagal dengan pesan error yang jelas — akun
TIDAK akan tersimpan sebagai "disetujui" bila emailnya gagal terkirim,
supaya admin tahu harus mencoba lagi.

## Skrip

| Perintah                | Fungsi                                                             |
| ------------------------ | -------------------------------------------------------------------- |
| `npm run dev`             | Jalankan server dengan auto-reload (tsx watch)                      |
| `npm run build`           | Compile TypeScript ke `dist/`                                       |
| `npm start`               | Jalankan hasil build (`dist/server.js`) — untuk produksi            |
| `npm run db:migrate`      | Jalankan `db/schema.sql` lalu `db/seed-content.sql`. Aman diulang.  |
| `npm run db:seed-admin`   | Buat/perbarui satu akun admin. Lihat opsi `--email`/`--password`/`--name` di dalam skrip. |
| `npm run db:setup`        | Migrate + seed-admin sekaligus, dengan nilai dari `.env`             |

## Menambah Jenis Konten Baru

Sebagian besar jenis konten (Statistik, Guru, Prestasi Siswa, dst.) memakai
CRUD generik — satu baris konfigurasi baru sudah cukup, tidak perlu menulis
controller atau route baru:

1. Tambahkan tabelnya di `db/schema.sql` (kolom `id`, `sort_order`, dan
   kolom kontennya sendiri — lihat tabel lain sebagai contoh).
2. Daftarkan resource-nya di `src/resources/registry.ts` — nama tabel,
   daftar kolom, dan aturan validasi tiap kolom.
3. Tambahkan entri yang sepadan (dengan `key` yang **sama persis**) di
   `../admin/src/lib/resourceDefinitions.ts` supaya form-nya muncul di
   dashboard.
4. Jalankan `npm run db:migrate` lagi.

Endpoint `GET/POST/PUT/DELETE /api/admin/{key}` dan `PUT
/api/admin/{key}/reorder` otomatis tersedia untuk resource baru tersebut,
divalidasi dengan Zod sesuai konfigurasi di langkah 2.

Konten singleton (bukan daftar) — seperti Profil Sekolah dan Visi — punya
pola berbeda; lihat `src/modules/schoolProfile/` sebagai contoh bila perlu
menambah jenis singleton baru.

## Struktur

```
src/
  crud/                    Mesin CRUD generik: repository, validator (Zod),
                            controller, router — dipakai oleh SEMUA resource
                            yang terdaftar di resources/registry.ts
  resources/registry.ts    Daftar semua jenis konten yang bisa diedit (lihat di atas)
  resources/icons.ts       Daftar nama ikon yang boleh dipakai — HARUS sama persis
                            dengan admin/src/lib/icons.ts
  modules/                 Modul dengan pola khusus (bukan CRUD generik):
                            auth (admin), users (akun publik PPDB + verifikasi
                            email), schoolProfile (singleton), visionMission
                            (gabungan singleton+daftar), contactMessages, publicSite
  middleware/               Auth guard, rate limiter, error handler terpusat
db/
  schema.sql                Struktur seluruh tabel
  seed-content.sql          Data contoh awal (aman dijalankan ulang)
```

## Endpoint Publik vs Admin

- **Publik** (tanpa login): `GET /api/site-content` (seluruh konten dalam
  satu panggilan, dipakai situs company profile), `GET /api/{resource}`
  per-resource, `POST /api/contact-messages` (formulir kontak),
  `POST /api/users/register`, `POST /api/users/verify`, `POST /api/users/login`.
- **User PPDB** (butuh header `Authorization: Bearer <token>` dari
  `POST /api/users/login`): `GET /api/users/me`, `POST /api/ppdb-registrations`,
  `GET /api/ppdb-registrations/my-status`.
- **Admin** (butuh header `Authorization: Bearer <token>` dari
  `POST /api/auth/login`): `/api/admin/*` — seluruh operasi tambah/ubah/hapus/
  atur-urutan, ditambah `GET /api/admin/contact-messages` untuk kotak masuk,
  dan `/api/admin/users/*` untuk menyetujui akun & mengirim kode verifikasi.
