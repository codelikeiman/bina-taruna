import type { ResourceConfig } from '../types/resource'

/**
 * Satu entri di sini = satu bagian konten yang bisa dikelola lewat
 * CRUD generik (list biasa: tambah / edit / hapus / urutkan).
 * Konten berbentuk "singleton" (profil sekolah, visi) TIDAK didaftarkan
 * di sini — itu punya modul & rute sendiri di src/modules/.
 *
 * Menambah bagian konten baru di masa depan cukup dengan menambah satu
 * entri di array ini — endpoint REST-nya otomatis tersedia lewat
 * src/crud/router.ts, tanpa perlu menulis controller baru.
 */
export const resources: ResourceConfig[] = [
  {
    key: 'stats',
    table: 'stats',
    label: 'Statistik',
    fields: [
      { name: 'icon', type: 'icon', required: true },
      { name: 'label', type: 'string', required: true, maxLength: 150 },
      { name: 'value', type: 'number', required: true, min: 0, max: 1_000_000 },
      { name: 'suffix', type: 'string', maxLength: 10 },
    ],
  },
  {
    key: 'history-paragraphs',
    table: 'history_paragraphs',
    label: 'Paragraf Sejarah',
    fields: [{ name: 'content', type: 'text', required: true, maxLength: 4000 }],
  },
  {
    key: 'milestones',
    table: 'milestones',
    label: 'Tonggak Sejarah',
    fields: [
      { name: 'year', type: 'string', required: true, maxLength: 16 },
      { name: 'title', type: 'string', required: true, maxLength: 200 },
      { name: 'description', type: 'text', required: true, maxLength: 2000 },
    ],
  },
  {
    key: 'missions',
    table: 'missions',
    label: 'Misi',
    fields: [{ name: 'content', type: 'text', required: true, maxLength: 1000 }],
  },
  {
    key: 'facilities',
    table: 'facilities',
    label: 'Fasilitas',
    fields: [
      { name: 'icon', type: 'icon', required: true },
      { name: 'title', type: 'string', required: true, maxLength: 200 },
      { name: 'description', type: 'text', required: true, maxLength: 1000 },
    ],
  },
  {
    key: 'extracurriculars',
    table: 'extracurriculars',
    label: 'Ekstrakurikuler',
    fields: [
      { name: 'icon', type: 'icon', required: true },
      { name: 'name', type: 'string', required: true, maxLength: 150 },
      // Opsional: detail & foto ekskul, tampil di modal saat kartu
      // ekskul diklik pada halaman publik.
      { name: 'description', type: 'text', maxLength: 2000 },
      { name: 'image_url', type: 'image' },
    ],
  },
  {
    key: 'achievements',
    table: 'achievements',
    label: 'Prestasi Siswa',
    fields: [
      { name: 'student_name', type: 'string', required: true, maxLength: 150 },
      { name: 'grade', type: 'string', required: true, maxLength: 100 },
      { name: 'title', type: 'string', required: true, maxLength: 200 },
      { name: 'level', type: 'string', required: true, maxLength: 150 },
      { name: 'icon', type: 'icon', required: true },
      // Opsional: foto siswa. Kosong = tampilan publik jatuh kembali ke ikon.
      { name: 'photo_url', type: 'image' },
    ],
  },
  {
    key: 'leadership',
    table: 'leadership',
    label: 'Pimpinan Sekolah',
    fields: [
      { name: 'name', type: 'string', required: true, maxLength: 150 },
      { name: 'role', type: 'string', required: true, maxLength: 150 },
      // Opsional: foto pimpinan. Kosong = tampilan publik jatuh kembali ke avatar inisial.
      { name: 'photo_url', type: 'image' },
    ],
  },
  {
    key: 'teachers',
    table: 'teachers',
    label: 'Guru',
    fields: [
      { name: 'name', type: 'string', required: true, maxLength: 150 },
      { name: 'subject', type: 'string', required: true, maxLength: 150 },
      // Opsional: foto guru. Kosong = tampilan publik jatuh kembali ke avatar inisial.
      { name: 'photo_url', type: 'image' },
    ],
  },
  {
    key: 'org-tiers',
    table: 'org_tiers',
    label: 'Struktur Organisasi',
    fields: [
      { name: 'level', type: 'string', required: true, maxLength: 150 },
      { name: 'names', type: 'string-list', required: true },
    ],
  },
  {
    key: 'gallery',
    table: 'gallery',
    label: 'Galeri',
    fields: [
      { name: 'title', type: 'string', required: true, maxLength: 200 },
      { name: 'icon', type: 'icon', required: true },
      // Opsional: foto kegiatan asli. Kosong = tampilan publik jatuh kembali ke kartu gradien + ikon.
      { name: 'photo_url', type: 'image' },
    ],
  },
  {
    key: 'testimonials',
    table: 'testimonials',
    label: 'Testimoni',
    fields: [
      { name: 'name', type: 'string', required: true, maxLength: 150 },
      { name: 'role', type: 'string', required: true, maxLength: 150 },
      { name: 'quote', type: 'text', required: true, maxLength: 1000 },
    ],
  },
  {
    // Daftar jurusan/peminatan PPDB (mis. IPA, IPS) — dipakai sebagai pilihan
    // dropdown di formulir pendaftaran publik (lihat modules/ppdb). Sengaja
    // ditaruh di CRUD generik (bukan modul ppdb sendiri) karena bentuknya
    // persis "daftar sederhana yang bisa ditambah/diedit/diurutkan admin",
    // sama seperti facilities/testimonials — tidak butuh logika khusus.
    key: 'ppdb-majors',
    table: 'ppdb_majors',
    label: 'Jurusan/Peminatan PPDB',
    fields: [{ name: 'name', type: 'string', required: true, maxLength: 150 }],
  },
]

export const resourcesByKey = new Map(resources.map((r) => [r.key, r]))
