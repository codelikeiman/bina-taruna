# Dashboard Admin — SMA Bina Taruna

Aplikasi dashboard untuk mengelola seluruh konten situs company profile SMA
Bina Taruna: profil sekolah, statistik, sejarah, visi-misi, fasilitas,
ekstrakurikuler, prestasi siswa, guru, struktur organisasi, galeri,
testimoni, dan pesan formulir kontak.

> Petunjuk lengkap menjalankan proyek ini bersama backend dan situs
> publiknya ada di **README di folder root** (`../README.md`). Dokumen ini
> hanya mencakup detail yang spesifik untuk aplikasi dashboard.

## Menjalankan

Backend (`../server/`) harus sudah berjalan lebih dulu di `http://localhost:4000`
dan sudah memiliki minimal satu akun admin (lihat README root, bagian
"Siapkan & jalankan backend").

```bash
npm install
npm run dev
```

Buka `http://localhost:5174`. Permintaan ke `/api` diteruskan otomatis ke
backend (diatur di `vite.config.ts`) — tidak perlu konfigurasi tambahan saat
development.

## Menambah Jenis Konten Baru

Setiap bagian konten yang bisa diedit (Statistik, Guru, Prestasi Siswa, dst.)
didefinisikan di **dua tempat** yang harus disunting bersamaan, dengan `key`
yang sama persis di keduanya:

1. `../server/src/resources/registry.ts` — struktur kolom & aturan validasi
2. `src/lib/resourceDefinitions.ts` — label berbahasa Indonesia & tipe input
   untuk form di dashboard

Setelah kedua entri ditambahkan (dan `server/db/schema.sql` diberi tabel
barunya, lalu `npm run db:migrate` dijalankan ulang di `server/`), halaman
CRUD lengkap — daftar, tambah, ubah, hapus, atur urutan — otomatis tersedia
tanpa menulis komponen React baru. Rute halamannya juga otomatis terbuat;
tinggal tambahkan entri navigasi di `src/lib/navigation.ts` agar muncul di
sidebar.

## Struktur

```
src/
  pages/                   Satu halaman per bagian: profil sekolah, visi-misi,
                            pesan masuk, akun — plus resources/ResourceListPage.tsx
                            (satu komponen generik untuk SEMUA daftar konten)
  components/              IconPicker, StringListEditor, ResourceForm, dll —
                            dipakai bersama oleh ResourceListPage untuk semua jenis konten
  lib/api.ts                Klien API: login, CRUD, profil sekolah, dsb.
  lib/resourceDefinitions.ts   Definisi setiap jenis konten untuk form (lihat di atas)
  lib/icons.ts               Daftar nama ikon yang boleh dipakai — HARUS sama persis
                              dengan server/src/resources/icons.ts
  context/AuthContext.tsx    Status login, disimpan di localStorage sebagai token JWT
```

## Ikon

Ikon dipilih lewat pencarian di dalam form (`IconPicker`), bukan diketik
bebas — daftarnya ada di `src/lib/icons.ts` dan **harus selalu sinkron**
dengan `server/src/resources/icons.ts`, karena backend menolak nama ikon di
luar daftar tersebut saat menyimpan.
