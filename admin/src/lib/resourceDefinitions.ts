import type { ResourceDef } from '../types/resource'

/**
 * Satu entri = satu bagian konten yang dikelola lewat editor daftar generik
 * (lihat pages/resources/ResourceListPage.tsx). `key` HARUS sama persis
 * dengan `key` resource yang bersangkutan di
 * server/src/resources/registry.ts, karena dipakai langsung sebagai
 * segmen URL: /api/admin/{key}.
 *
 * Menambah bagian konten baru di masa depan: tambahkan satu entri resource
 * baru di server/src/resources/registry.ts DAN satu entri di sini dengan
 * `key` yang sama — keduanya harus disunting bersamaan.
 */
export const resourceDefinitions: ResourceDef[] = [
  {
    key: 'stats',
    label: 'Statistik',
    labelSingular: 'Statistik',
    titleField: 'label',
    subtitleField: 'value',
    fields: [
      { name: 'icon', label: 'Ikon', type: 'icon', required: true },
      { name: 'label', label: 'Label', type: 'string', required: true, maxLength: 150, placeholder: 'mis. Siswa Aktif' },
      { name: 'value', label: 'Angka', type: 'number', required: true, min: 0, max: 1_000_000 },
      { name: 'suffix', label: 'Akhiran', type: 'string', maxLength: 10, placeholder: 'mis. + atau %', hint: 'Opsional, tampil setelah angka.' },
    ],
  },
  {
    key: 'history-paragraphs',
    label: 'Paragraf Sejarah',
    labelSingular: 'Paragraf',
    titleField: 'content',
    fields: [
      { name: 'content', label: 'Isi Paragraf', type: 'text', required: true, maxLength: 4000 },
    ],
  },
  {
    key: 'milestones',
    label: 'Tonggak Sejarah',
    labelSingular: 'Tonggak Sejarah',
    titleField: 'title',
    subtitleField: 'year',
    fields: [
      { name: 'year', label: 'Tahun', type: 'string', required: true, maxLength: 16, placeholder: 'mis. 1985' },
      { name: 'title', label: 'Judul', type: 'string', required: true, maxLength: 200 },
      { name: 'description', label: 'Deskripsi', type: 'text', required: true, maxLength: 2000 },
    ],
  },
  {
    key: 'missions',
    label: 'Misi',
    labelSingular: 'Misi',
    titleField: 'content',
    fields: [
      { name: 'content', label: 'Isi Misi', type: 'text', required: true, maxLength: 1000 },
    ],
  },
  {
    key: 'facilities',
    label: 'Fasilitas',
    labelSingular: 'Fasilitas',
    titleField: 'title',
    fields: [
      { name: 'icon', label: 'Ikon', type: 'icon', required: true },
      { name: 'title', label: 'Nama Fasilitas', type: 'string', required: true, maxLength: 200 },
      { name: 'description', label: 'Deskripsi', type: 'text', required: true, maxLength: 1000 },
    ],
  },
  {
    key: 'extracurriculars',
    label: 'Ekstrakurikuler',
    labelSingular: 'Ekstrakurikuler',
    titleField: 'name',
    fields: [
      { name: 'icon', label: 'Ikon', type: 'icon', required: true },
      { name: 'name', label: 'Nama Ekskul', type: 'string', required: true, maxLength: 150 },
      {
        name: 'description',
        label: 'Deskripsi',
        type: 'text',
        maxLength: 2000,
        placeholder: 'Ceritakan kegiatan, jadwal latihan, atau pencapaian ekskul ini...',
        hint: 'Opsional. Ditampilkan saat pengunjung mengklik kartu ekskul ini di halaman publik.',
      },
      {
        name: 'image_url',
        label: 'Foto Ekskul',
        type: 'image',
        hint: 'Opsional. Format JPG, PNG, atau WEBP. Ditampilkan di bagian bawah detail ekskul.',
      },
    ],
  },
  {
    key: 'achievements',
    label: 'Prestasi Siswa',
    labelSingular: 'Prestasi',
    titleField: 'title',
    subtitleField: 'student_name',
    fields: [
      { name: 'icon', label: 'Ikon', type: 'icon', required: true },
      { name: 'title', label: 'Nama Prestasi', type: 'string', required: true, maxLength: 200, placeholder: 'mis. Juara 1 OSN Matematika' },
      { name: 'level', label: 'Tingkat & Tahun', type: 'string', required: true, maxLength: 150, placeholder: 'mis. Tingkat Provinsi 2025' },
      { name: 'student_name', label: 'Nama Siswa', type: 'string', required: true, maxLength: 150 },
      { name: 'grade', label: 'Kelas', type: 'string', required: true, maxLength: 100, placeholder: 'mis. Kelas XII IPA 1' },
      {
        name: 'photo_url',
        label: 'Foto Siswa',
        type: 'image',
        hint: 'Opsional. Format JPG, PNG, atau WEBP. Jika kosong, kartu akan menampilkan ikon di atas sebagai gantinya.',
      },
    ],
  },
  {
    key: 'leadership',
    label: 'Pimpinan Sekolah',
    labelSingular: 'Pimpinan',
    titleField: 'name',
    subtitleField: 'role',
    fields: [
      { name: 'name', label: 'Nama Lengkap & Gelar', type: 'string', required: true, maxLength: 150 },
      { name: 'role', label: 'Jabatan', type: 'string', required: true, maxLength: 150, placeholder: 'mis. Kepala Sekolah' },
      {
        name: 'photo_url',
        label: 'Foto',
        type: 'image',
        hint: 'Opsional. Format JPG, PNG, atau WEBP. Jika kosong, kartu akan menampilkan avatar inisial sebagai gantinya.',
      },
    ],
  },
  {
    key: 'teachers',
    label: 'Guru',
    labelSingular: 'Guru',
    titleField: 'name',
    subtitleField: 'subject',
    fields: [
      { name: 'name', label: 'Nama Lengkap & Gelar', type: 'string', required: true, maxLength: 150 },
      { name: 'subject', label: 'Mata Pelajaran', type: 'string', required: true, maxLength: 150 },
      {
        name: 'photo_url',
        label: 'Foto',
        type: 'image',
        hint: 'Opsional. Format JPG, PNG, atau WEBP. Jika kosong, kartu akan menampilkan avatar inisial sebagai gantinya.',
      },
    ],
  },
  {
    key: 'org-tiers',
    label: 'Struktur Organisasi',
    labelSingular: 'Tingkat Struktur',
    titleField: 'level',
    fields: [
      { name: 'level', label: 'Nama Tingkat', type: 'string', required: true, maxLength: 150, placeholder: 'mis. Wakil Kepala Sekolah' },
      {
        name: 'names',
        label: 'Nama / Jabatan di Tingkat Ini',
        type: 'string-list',
        required: true,
        hint: 'Satu tingkat bisa memuat beberapa kotak — tambahkan satu per satu. Contoh: tingkat "Wakil Kepala Sekolah" bisa memuat "Kurikulum", "Kesiswaan", dst.',
      },
    ],
  },
  {
    key: 'gallery',
    label: 'Galeri',
    labelSingular: 'Foto Galeri',
    titleField: 'title',
    fields: [
      { name: 'icon', label: 'Ikon', type: 'icon', required: true },
      { name: 'title', label: 'Judul', type: 'string', required: true, maxLength: 200 },
      {
        name: 'photo_url',
        label: 'Foto Kegiatan',
        type: 'image',
        hint: 'Opsional. Format JPG, PNG, atau WEBP. Jika kosong, kartu akan menampilkan gradien warna + ikon di atas sebagai gantinya.',
      },
    ],
  },
  {
    key: 'testimonials',
    label: 'Testimoni',
    labelSingular: 'Testimoni',
    titleField: 'name',
    subtitleField: 'role',
    fields: [
      { name: 'name', label: 'Nama', type: 'string', required: true, maxLength: 150 },
      { name: 'role', label: 'Peran', type: 'string', required: true, maxLength: 150, placeholder: 'mis. Alumni Angkatan 2015' },
      { name: 'quote', label: 'Kutipan Testimoni', type: 'text', required: true, maxLength: 1000 },
    ],
  },
  {
    // Dipakai formulir pendaftaran PPDB publik sebagai pilihan Jurusan/
    // Peminatan (lihat halaman "Pendaftar" & "Pengaturan PPDB" di menu
    // PPDB). Kosongkan daftar ini bila sekolah Anda tidak menerapkan
    // penjurusan — field terkait otomatis disembunyikan di formulir publik.
    key: 'ppdb-majors',
    label: 'Jurusan/Peminatan PPDB',
    labelSingular: 'Jurusan/Peminatan',
    titleField: 'name',
    fields: [{ name: 'name', label: 'Nama Jurusan/Peminatan', type: 'string', required: true, maxLength: 150, placeholder: 'mis. IPA' }],
  },
]

export const resourceDefinitionsByKey = new Map(resourceDefinitions.map((r) => [r.key, r]))
