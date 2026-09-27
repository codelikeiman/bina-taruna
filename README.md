# Company Profile — SMA Bina Taruna

Website company profile untuk **SMA Bina Taruna**, sekarang terdiri dari tiga
bagian yang saling terhubung:

| Folder    | Apa isinya                                                   | Port (development) |
| --------- | ------------------------------------------------------------- | ------------------- |
| *(root)*  | Situs publik — React + Vite, Tailwind CSS v4, Framer Motion   | `5173`               |
| `server/` | Backend API — Express + TypeScript + PostgreSQL (Supabase)    | `4000`               |
| `admin/`  | Dashboard admin — React + Vite + TypeScript                   | `5174`               |

Seluruh konten (profil sekolah, statistik, sejarah, visi-misi, fasilitas,
ekstrakurikuler, prestasi siswa, guru, struktur organisasi, galeri, testimoni,
dan pesan kontak) disimpan di database PostgreSQL (Supabase) dan dikelola
lewat dashboard admin — bukan lagi lewat mengedit file kode. Foto & dokumen
unggahan (foto konten publik, berkas PPDB) disimpan di Supabase Storage,
bukan disk lokal — supaya backend bisa jalan sebagai serverless function di
Vercel tanpa filesystem persisten.

Termasuk juga **PPDB (Penerimaan Peserta Didik Baru)** — formulir pendaftaran
online untuk calon siswa, dengan alur *admin-mediated*: calon siswa/orang tua
mengisi formulir sendiri di situs publik, admin memverifikasi data & berkas
lewat dashboard, baru admin yang meneruskan data tersebut ke Dinas Pendidikan
(lewat cara apa pun yang dipakai dinas setempat — portal mereka sendiri,
unggah manual, dsb.). Lihat bagian [PPDB](#ppdb-penerimaan-peserta-didik-baru)
di bawah untuk detail lengkap.

## Menjalankan Ketiganya (Development)

Database & storage-nya selalu Supabase cloud (tidak ada versi lokal) — jadi
yang dibutuhkan cuma Node.js 22 dan satu project Supabase yang sudah dibuat.
Ada dua cara menjalankan: native (npm langsung) atau Docker.

### Persiapan Supabase (sekali saja)

1. Di [Supabase Dashboard](https://supabase.com/dashboard), buat 2 bucket di
   **Storage**: `photos` (Public bucket) dan `ppdb-documents` (Private bucket).
2. Ambil `SUPABASE_URL` & `service_role key` dari **Project Settings → API**.

### Cara A — Native (npm)

Buka **tiga terminal terpisah**, satu untuk tiap bagian.

**1. Backend (`server/`)**

```bash
cd server
npm install
cp .env.example .env
```

Isi `.env`: `DATABASE_URL` dari Supabase Dashboard → tombol **Connect**,
`SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` dari langkah persiapan di atas,
lalu buat `JWT_SECRET`/`USER_JWT_SECRET`/`ENCRYPTION_KEY` acak (perintah
contoh ada di dalam `.env.example` — **`ENCRYPTION_KEY` wajib**, lihat
peringatan pentingnya di bagian [PPDB](#ppdb-penerimaan-peserta-didik-baru)
di bawah).

Migrasikan skema + isi data contoh, lalu buat akun admin pertama:

```bash
npm run db:migrate
npm run db:seed-admin -- --email="admin@sekolah.sch.id" --password="PasswordKuat123" --name="Admin"
```

Jika sebelumnya sempat pakai versi lama (upload ke disk lokal) dan ada
berkas tersisa di `server/uploads/`, pindahkan dulu ke Supabase Storage:

```bash
npm run migrate:uploads
```

Jalankan servernya:

```bash
npm run dev
```

Backend siap di `http://localhost:4000`. Cek dengan membuka
`http://localhost:4000/api/health` di browser — harus muncul `{"status":"ok"}`.

**2. Situs publik (root folder)**, di terminal baru:

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Permintaan ke `/api` otomatis diteruskan ke
backend di port `4000` (diatur di `vite.config.js`) — tidak perlu konfigurasi
tambahan saat development.

**3. Dashboard admin (`admin/`)**, di terminal baru:

```bash
cd admin
npm install
npm run dev
```

Buka `http://localhost:5174`, lalu login dengan email & password yang dibuat
lewat `db:seed-admin` di atas.

**Ganti password default segera setelah login pertama** lewat menu
**Akun Saya**, terutama bila Anda tidak menentukan `--password` sendiri saat
menjalankan `db:seed-admin` (nilai contoh di `.env.example` bukan untuk situs
yang sudah live).

### Cara B — Docker

Alternatif kalau tidak mau install Node.js langsung di mesin, atau ingin
mereproduksi versi Node.js yang sama dengan yang dipakai Vercel saat deploy
nanti (lihat catatan `engines.node` di `server/package.json`). **Docker di
sini murni untuk development lokal** — Vercel tidak membaca `Dockerfile.dev`
maupun `docker-compose.yml` ini sama sekali saat deploy produksi (lihat
bagian [Deploy ke Vercel](#deploy-ke-vercel) di bawah untuk penjelasannya).

Setelah `server/.env` diisi seperti langkah "Persiapan Supabase" + isian
`.env` di Cara A di atas:

```bash
docker compose up --build
```

Buka `http://localhost:5173` (situs publik), `http://localhost:5174` (admin),
`http://localhost:4000/api/health` (backend) — sama seperti Cara A. Perubahan
kode di host langsung ke-reload di dalam container (bind mount + HMR Vite).

## Alur Kerja Sehari-hari

Setelah ketiganya berjalan: buka dashboard admin, edit/tambah/hapus konten apa
pun (mis. tambah prestasi siswa baru, ubah nomor telepon, tambah anggota
ekskul). Muat ulang situs publik (`localhost:5173`) — perubahan langsung
terlihat, tanpa perlu deploy ulang atau mengedit kode apa pun.

Dashboard admin mendukung:

- **Profil & Kontak** dan **Visi & Misi** — formulir untuk data yang hanya
  satu (bukan daftar).
- **Statistik, Fasilitas, Ekstrakurikuler, Prestasi Siswa, Pimpinan Sekolah,
  Guru, Struktur Organisasi, Galeri, Testimoni** — daftar dengan tombol
  tambah/ubah/hapus, serta panah naik/turun untuk mengatur urutan tampil di
  situs publik.
- **Pesan Masuk** — pesan dari formulir kontak di situs publik, dengan
  penanda sudah/belum dibaca.
- **PPDB → Pendaftar, Pengaturan PPDB, Jurusan/Peminatan** — kelola
  pendaftaran calon siswa baru. Lihat bagian
  [PPDB](#ppdb-penerimaan-peserta-didik-baru) di bawah untuk alur lengkapnya.
- **Akun Saya** — ganti password login dashboard.

## PPDB (Penerimaan Peserta Didik Baru)

Formulir pendaftaran calon siswa baru, dapat diakses publik di `/ppdb` (dan
cek status di `/ppdb/status`). Alurnya **admin-mediated** — bukan integrasi
langsung ke sistem Dinas Pendidikan:

```
Calon siswa/orang tua mengisi formulir di /ppdb
              │
              ▼
   Status: "Menunggu Verifikasi"  (diajukan)
              │
              ▼
   Admin meninjau data & 4 dokumen (KK, akta, ijazah/SKL, pas foto)
   di dashboard → Pendaftar
              │
       ┌──────┴──────┐
       ▼             ▼
 "Perlu Revisi"   "Terverifikasi"
 (admin isi          │
  catatan,            ▼
  hubungi        "Terkirim ke Dinas"
  orang tua       (admin sudah meneruskan
  langsung)        data ke dinas dengan
                    caranya sendiri —
                    portal dinas, unggah
                    manual, dsb.)
                       │
                 ┌─────┴─────┐
                 ▼           ▼
             "Diterima"  "Tidak Diterima"
```

### Persiapan sebelum dipakai

1. **Buka pendaftaran & atur tahun ajaran** — dashboard → **PPDB** →
   **Pengaturan PPDB**. Pendaftaran **tertutup secara default** setelah
   instalasi baru (`npm run db:migrate`) — publik akan melihat pesan
   "belum dibuka" sampai Anda mengaktifkannya di sini.
2. **(Opsional) isi Jurusan/Peminatan** — dashboard → **PPDB** →
   **Jurusan/Peminatan**. Kosongkan daftar ini bila sekolah Anda tidak
   menerapkan penjurusan di jenjang SMA — field terkait otomatis
   disembunyikan di formulir publik saat daftar ini kosong.
3. Pastikan `ENCRYPTION_KEY` sudah diisi di `server/.env` (lihat langkah
   setup backend di atas) — **tanpa ini server tidak akan menyala sama
   sekali**, bukan cuma fitur PPDB yang gagal.

### Mengirim data ke Dinas Pendidikan

Setelah status **Terverifikasi**, admin membuka dashboard → **PPDB** →
**Pendaftar**, filter status sesuai kebutuhan, lalu klik **Ekspor CSV**. Berkas
CSV berisi seluruh data pendaftar (termasuk NIK asli, sudah didekripsi) dengan
kolom berbahasa Indonesia — siap diunggah ke portal PPDB milik dinas (atau
diinput manual bila dinas Anda belum punya fitur impor). Setelah selesai
dikirim, tandai status pendaftaran terkait sebagai **Terkirim ke Dinas** di
halaman detail masing-masing.

### Keamanan yang diterapkan

- **NIK dienkripsi** (AES-256-GCM) di database, bukan tersimpan sebagai teks
  polos — hanya admin yang login yang bisa melihatnya (dengan NIK tersamar
  secara default di layar, ada tombol untuk menampilkan).
- **Berkas diverifikasi dari isinya**, bukan dari nama file/ekstensi —
  mencegah berkas berbahaya menyamar sebagai gambar/PDF.
- **Berkas tidak bisa diakses lewat URL langsung** — hanya lewat dashboard
  admin yang sudah login.
- **NIK duplikat ditolak** otomatis (satu NIK = satu pendaftaran).
- **Rate limiting** & **honeypot** anti-bot pada formulir publik.
- **Nomor pendaftaran acak** (bukan berurutan) supaya tidak mudah ditebak
  saat mengecek status.

> ⚠️ **`ENCRYPTION_KEY` di `server/.env` WAJIB di-backup di tempat aman &
> terpisah** (mis. password manager tim) — sama pentingnya dengan
> `JWT_SECRET`/password database. **Bila nilai ini hilang atau berubah,
> seluruh NIK pendaftar yang sudah tersimpan tidak bisa dibaca lagi
> selamanya** (bukan sekadar terkunci — datanya secara matematis tidak bisa
> didekripsi tanpa kunci yang sama persis). Jangan pernah meng-generate ulang
> nilai ini di server yang sudah punya data pendaftar.

### Keterbatasan saat ini (kandidat pengembangan lanjutan)

- Calon siswa **tidak bisa mengedit sendiri** pendaftaran yang sudah
  dikirim — bila admin menandai "Perlu Revisi", orang tua perlu dihubungi
  langsung (kontak sekolah) untuk menyelesaikannya, bukan lewat form self-service.
  Catatan revisi tetap tampil ke publik lewat halaman cek status (`/ppdb/status`).
  Notifikasi otomatis (WhatsApp/email) saat status berubah — belum tersedia.
- Provinsi memakai daftar tetap (38 provinsi resmi), tapi Kabupaten/Kota,
  Kecamatan, dan Kelurahan/Desa berupa isian teks bebas — bukan dropdown
  bertingkat dari data wilayah resmi (butuh sumber data wilayah pihak ketiga
  yang sengaja tidak disertakan agar situs tidak bergantung pada layanan
  eksternal).
- Anti-bot formulir publik memakai honeypot + rate limiting, belum CAPTCHA
  pihak ketiga (mis. Cloudflare Turnstile) — bisa ditambahkan belakangan bila
  spam menjadi masalah nyata.
- Tidak ada integrasi API langsung ke sistem Dinas Pendidikan (memang sengaja
  — lihat bagian "Mengirim data ke Dinas Pendidikan" di atas) karena
  kebanyakan dinas tidak menyediakan API publik untuk ini.

## Struktur Proyek

```
sma-bina-taruna/
├── src/                      Situs publik (React + Vite)
│   ├── components/           Satu file per bagian halaman (Hero, Fasilitas, dst.)
│   │                         — semua menerima konten lewat props, bukan import statis
│   ├── components/ppdb/      Formulir pendaftaran PPDB (wizard multi-step) & cek status
│   ├── pages/                Halaman dengan rute sendiri (PPDB, cek status) — beranda
│   │                         tetap satu halaman scroll panjang di App.jsx seperti semula
│   ├── hooks/useSiteContent.js   Memuat seluruh konten dari API backend
│   ├── lib/siteContentApi.js     Klien API: ambil konten, kirim formulir kontak
│   ├── lib/ppdbApi.js            Klien API modul PPDB
│   ├── lib/resolveIcon.js        Mengubah nama ikon (string dari API) jadi komponen
│   └── data/schoolData.js        HANYA navigasi menu — bukan lagi tempat konten
│
├── server/                   Backend API (Express + TypeScript + PostgreSQL/Supabase)
│   ├── db/schema.sql         Struktur tabel database
│   ├── db/seed-content.sql   Data contoh awal
│   ├── src/modules/ppdb/     Modul PPDB: validasi, upload berkas, enkripsi NIK,
│   │                         router publik & admin
│   ├── src/utils/crypto.ts   Enkripsi AES-256-GCM + blind-index HMAC (dipakai modul PPDB)
│   └── src/resources/registry.ts   Daftar semua jenis konten yang bisa diedit —
│                                    menambah baris di sini + satu entri yang sepadan
│                                    di admin/src/lib/resourceDefinitions.ts adalah
│                                    cara menambah jenis konten baru
│
└── admin/                    Dashboard admin (React + Vite + TypeScript)
    └── src/pages/            Satu halaman per bagian konten
        └── ppdb/              Halaman Pendaftar, Detail Pendaftar, Pengaturan PPDB
```

## Menambahkan Google Maps Asli

Di `src/components/Contact.jsx`, ganti kotak peta ilustratif dengan embed
Google Maps asli. Cara mendapatkan kodenya: buka Google Maps → cari lokasi
sekolah → **Bagikan** → **Sematkan peta** → salin kode `iframe` yang
diberikan, lalu tempelkan menggantikan elemen placeholder (ada komentar
penanda lokasinya di dalam kode).

## Mengganti Foto

Bagian **Galeri** dan **Guru** di situs publik saat ini memakai ilustrasi
warna & inisial sebagai placeholder (bukan foto sungguhan), supaya tidak ada
foto orang/tempat yang keliru ditampilkan seolah-olah itu SMA Bina Taruna.
Mengganti dengan foto asli butuh sedikit penyesuaian kode (folder galeri saat
ini hanya menyimpan judul + ikon per item, bukan berkas gambar) — simpan foto
di `src/assets/`, lalu sesuaikan `src/components/Gallery.jsx` dan
`src/components/Teachers.jsx` untuk menampilkan `<img>` alih-alih ilustrasi.

## Kustomisasi Warna & Font

Skema warna (navy, gold/emas, maroon) dan font (Fraunces untuk judul, Plus
Jakarta Sans untuk teks) diatur terpusat di `src/index.css` pada blok
`@theme`. Dashboard admin (`admin/src/index.css`) memakai token warna yang
sama persis — ubah di kedua tempat bila ingin skema warna keduanya tetap
seragam.

## Deploy ke Vercel

Ketiga bagian di-deploy sebagai **3 project Vercel terpisah** dari repo yang
sama — masing-masing dengan "Root Directory" berbeda di pengaturan project.
Vercel **tidak membaca Dockerfile** proyek ini sama sekali; Docker
(`docker-compose.yml`) di sini murni untuk development lokal (lihat bagian
[Development](#cara-b--docker) di atas) — Vercel build langsung dari source
lewat build system-nya sendiri.

### 0. Sebelum deploy: migrasi upload lama (kalau ada)

Kalau proyek ini sebelumnya pernah dijalankan dengan versi upload-ke-disk
lokal, jalankan dulu (lihat langkah lengkap di bagian Development di atas):

```bash
cd server && npm run migrate:uploads
```

Deploy serverless **tidak punya disk persisten** — berkas yang masih di
`server/uploads/` tidak akan ikut ter-deploy dan tidak bisa dibaca backend.

### 1. Project backend (`server/`)

- **Root Directory**: `server`
- Framework preset: Other (Vercel otomatis mendeteksi `api/index.ts` sebagai
  serverless function lewat `server/vercel.json`)
- **Environment Variables** (isi persis seperti `server/.env.example`,
  termasuk semua yang wajib: `DATABASE_URL`, `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `USER_JWT_SECRET`,
  `ENCRYPTION_KEY`, `SMTP_*`, dst.) — **kecuali** `DATABASE_URL` harus pakai
  **Transaction pooler** Supabase (port `6543`, bukan `5432`) dan tambahkan
  `DB_POOL_MAX=1`, karena tiap invocation serverless adalah koneksi baru ke
  Postgres (lihat komentar di `server/api/index.ts` & `.env.example`).
- Setelah deploy, catat domainnya (mis. `https://api-bina-taruna.vercel.app`)
  — dipakai di langkah 2 & 3.

### 2. Project situs publik (root)

- **Root Directory**: *(kosongkan — root repo)*
- Framework preset: Vite (otomatis terdeteksi)
- **Environment Variables**: `VITE_API_BASE_URL` = domain backend dari
  langkah 1 (lihat `.env.example` di root)

### 3. Project dashboard admin (`admin/`)

- **Root Directory**: `admin`
- Framework preset: Vite (otomatis terdeteksi)
- **Environment Variables**: `VITE_API_BASE_URL` = domain backend dari
  langkah 1 (lihat `admin/.env.example`)
- Disarankan: set project ini agar **tidak diindeks mesin pencari** (mis.
  lewat `Vercel Authentication`/password protection di pengaturan project,
  atau `robots.txt`), karena ini dashboard internal, bukan halaman publik.

### 4. Setelah ketiganya live

Di project backend (langkah 1), update `FRONTEND_ORIGIN` supaya memuat
kedua domain dari langkah 2 & 3 (dipisah koma) — ini yang dicek CORS agar
situs publik dan admin diizinkan memanggil API. Redeploy backend setelah
mengubah env var ini.

**Penting untuk situs publik**: sejak ada halaman PPDB (`/ppdb`,
`/ppdb/status`), situs publik memakai client-side routing (React Router) —
Vercel menangani SPA fallback ini otomatis untuk proyek Vite, tidak perlu
konfigurasi tambahan.

## Teknologi

**Situs publik & Dashboard admin:**
- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Framer Motion](https://motion.dev) — animasi scroll-reveal & interaksi (situs publik)
- [Lucide React](https://lucide.dev) — ikon
- [React Router](https://reactrouter.com) — navigasi antar halaman (situs publik: beranda,
  PPDB, cek status · dashboard admin: seluruh halaman)

**Backend:**
- [Express](https://expressjs.com) + [TypeScript](https://www.typescriptlang.org)
- [PostgreSQL](https://www.postgresql.org) (hosted di [Supabase](https://supabase.com)) lewat [pg (node-postgres)](https://node-postgres.com)
- [Supabase Storage](https://supabase.com/storage) — foto konten publik & dokumen PPDB
- [Zod](https://zod.dev) — validasi data
- JWT ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — autentikasi
- [Multer](https://github.com/expressjs/multer) — unggahan berkas (dokumen PPDB), disimpan
  sementara di memori lalu divalidasi dari isinya sebelum diunggah ke Supabase Storage
  (lihat bagian [PPDB](#ppdb-penerimaan-peserta-didik-baru))

Animasi di situs publik menghormati preferensi *reduced motion* perangkat
pengguna secara otomatis (lewat `MotionConfig reducedMotion="user"` di
`src/App.jsx`).
