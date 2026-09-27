// =============================================================
// KONFIGURASI STATIS SITUS
//
// Seluruh KONTEN sekolah (profil, statistik, sejarah, visi & misi,
// fasilitas, ekskul, prestasi, guru, struktur organisasi, galeri,
// testimoni) kini dikelola lewat dashboard admin dan disimpan di
// database MySQL — bukan lagi di file ini. Lihat:
//   - src/hooks/useSiteContent.js  (memuat konten dari API)
//   - server/src/resources/registry.ts  (definisi tiap jenis konten)
//   - ../admin/  (aplikasi dashboard untuk mengedit konten)
//
// File ini HANYA menyimpan konfigurasi murni tampilan/navigasi yang
// tidak berubah-ubah dan tidak perlu diedit lewat dashboard.
// =============================================================

// Prefiks "/" (bukan cuma "#...") supaya link ini tetap benar dipencet dari
// halaman lain (mis. /ppdb) — browser akan pindah ke beranda dulu baru
// scroll ke section terkait, bukan mencari id tersebut di halaman yang
// sedang dibuka (yang tentu tidak ada). Lihat juga Navbar.jsx & Hero.jsx
// yang punya beberapa link serupa di luar daftar ini.
export const navLinks = [
  { label: 'Beranda', href: '/#beranda' },
  { label: 'Tentang', href: '/#tentang' },
  { label: 'Fasilitas', href: '/#fasilitas' },
  { label: 'Ekskul', href: '/#ekskul' },
  { label: 'Prestasi', href: '/#prestasi' },
  { label: 'Guru', href: '/#guru' },
  { label: 'Galeri', href: '/#galeri' },
  { label: 'Kontak', href: '/#kontak' },
  { label: 'PPDB', href: '/ppdb' },
]
