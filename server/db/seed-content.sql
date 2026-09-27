-- =============================================================
-- Seed content — migrasi 1:1 dari src/data/schoolData.js supaya
-- dashboard admin langsung terisi dengan konten yang sudah ada
-- (masih data contoh/placeholder, sesuai catatan di README proyek).
-- Aman dijalankan berulang: setiap tabel konten dikosongkan dulu
-- sebelum diisi ulang. Tabel `admins` TIDAK disentuh di sini.
-- =============================================================

-- ---------------------------------------------------------------
-- Profil sekolah (singleton)
-- ---------------------------------------------------------------
DELETE FROM school_profile WHERE id = 1;
INSERT INTO school_profile
  (id, name, short_name, full_legal_name, tagline, motto, founded_year, accreditation, npsn,
   email, phone, whatsapp, address_street, address_area, address_city, instagram, youtube, facebook)
VALUES
  (1, 'SMA Bina Taruna', 'SMA Bina Taruna', 'Sekolah Menengah Atas Bina Taruna',
   'Cerdas · Berkarakter · Berprestasi',
   'Membentuk generasi unggul yang beriman, berilmu, dan berdaya saing global.',
   1985, 'A (Unggul)', '20123456',
   'info@smabinataruna.sch.id', '(022) 123-4567', '+62 812-3456-7890',
   'Jl. Pendidikan Taruna No. 45', 'Kel. Sukamaju, Kec. Cempaka Putih', 'Kota Bandung, Jawa Barat 40123',
   '@smabinataruna', 'SMA Bina Taruna Official', 'SMA Bina Taruna');

-- ---------------------------------------------------------------
-- Statistik
-- ---------------------------------------------------------------
DELETE FROM stats;
INSERT INTO stats (icon, label, value, suffix, sort_order) VALUES
  ('Clock', 'Tahun Pengalaman', 41, '+', 1),
  ('Users', 'Siswa Aktif', 850, '+', 2),
  ('GraduationCap', 'Tenaga Pendidik', 65, '+', 3),
  ('Sparkles', 'Ekstrakurikuler', 15, '+', 4),
  ('Trophy', 'Prestasi 5 Tahun Terakhir', 150, '+', 5),
  ('CheckCircle2', 'Tingkat Kelulusan', 100, '%', 6);

-- ---------------------------------------------------------------
-- Sejarah — paragraf
-- ---------------------------------------------------------------
DELETE FROM history_paragraphs;
INSERT INTO history_paragraphs (content, sort_order) VALUES
  ('SMA Bina Taruna didirikan pada tahun 1985 oleh sekelompok pendidik dan tokoh masyarakat yang meyakini bahwa pendidikan berkualitas adalah kunci utama membangun generasi bangsa. Berawal dari tiga rombongan belajar dan sembilan puluh siswa, sekolah ini tumbuh menjadi salah satu institusi pendidikan menengah atas yang diperhitungkan di wilayahnya.', 1),
  ('Selama lebih dari empat dekade, SMA Bina Taruna terus berbenah — memperkuat kurikulum, membangun fasilitas modern, dan mencetak lulusan yang tidak hanya unggul secara akademik, tetapi juga berkarakter dan siap bersaing di tingkat nasional maupun global.', 2);

-- ---------------------------------------------------------------
-- Sejarah — tonggak (milestones)
-- ---------------------------------------------------------------
DELETE FROM milestones;
INSERT INTO milestones (year, title, description, sort_order) VALUES
  ('1985', 'Awal Berdiri', 'Resmi berdiri dengan 3 rombongan belajar dan 90 siswa angkatan pertama.', 1),
  ('1995', 'Akreditasi A Pertama', 'Meraih akreditasi A dari Badan Akreditasi Nasional Sekolah/Madrasah.', 2),
  ('2005', 'Gedung & Laboratorium Baru', 'Peresmian gedung tiga lantai beserta laboratorium IPA dan komputer terpadu.', 3),
  ('2015', 'Juara Umum Nasional', 'Meraih predikat juara umum dalam ajang O2SN dan OSN tingkat nasional.', 4),
  ('2023', 'Digitalisasi & Kerja Sama Global', 'Meluncurkan program kelas digital dan kerja sama pertukaran pelajar internasional.', 5);

-- ---------------------------------------------------------------
-- Visi (singleton) & Misi (list)
-- ---------------------------------------------------------------
DELETE FROM vision_mission WHERE id = 1;
INSERT INTO vision_mission (id, vision) VALUES
  (1, 'Mewujudkan generasi unggul yang beriman dan bertakwa, berilmu pengetahuan, berkarakter mulia, serta mampu bersaing di tingkat global.');

DELETE FROM missions;
INSERT INTO missions (content, sort_order) VALUES
  ('Menyelenggarakan proses pembelajaran yang inovatif, kreatif, dan berbasis teknologi.', 1),
  ('Menumbuhkan nilai keimanan, ketakwaan, dan akhlak mulia dalam setiap kegiatan sekolah.', 2),
  ('Mengembangkan potensi, bakat, dan minat siswa melalui kegiatan akademik maupun non-akademik.', 3),
  ('Membentuk pribadi yang disiplin, mandiri, dan bertanggung jawab.', 4),
  ('Menjalin kerja sama dengan orang tua, masyarakat, dan dunia industri untuk mendukung mutu pendidikan.', 5),
  ('Menyiapkan lulusan yang siap melanjutkan pendidikan tinggi maupun bersaing di dunia kerja.', 6);

-- ---------------------------------------------------------------
-- Fasilitas
-- ---------------------------------------------------------------
DELETE FROM facilities;
INSERT INTO facilities (icon, title, description, sort_order) VALUES
  ('Monitor', 'Ruang Kelas Ber-AC & Smart Board', 'Ruang belajar nyaman dilengkapi papan pintar interaktif di setiap kelas.', 1),
  ('FlaskConical', 'Laboratorium IPA Terpadu', 'Laboratorium Fisika, Kimia, dan Biologi dengan peralatan praktikum lengkap.', 2),
  ('Cpu', 'Laboratorium Komputer & Multimedia', 'Fasilitas TIK modern untuk mendukung pembelajaran berbasis teknologi.', 3),
  ('BookOpen', 'Perpustakaan Digital', 'Koleksi ribuan judul buku fisik dan digital yang dapat diakses siswa kapan saja.', 4),
  ('Dumbbell', 'Lapangan Olahraga', 'Lapangan basket, futsal, dan voli berstandar untuk menunjang kegiatan olahraga.', 5),
  ('Landmark', 'Masjid & Musala Sekolah', 'Tempat ibadah yang nyaman untuk mendukung kegiatan keagamaan siswa.', 6),
  ('Users', 'Aula Serbaguna', 'Ruang berkapasitas 500 orang untuk acara sekolah dan pertunjukan seni.', 7),
  ('Heart', 'Kantin Sehat & UKS', 'Kantin dengan standar gizi terjaga serta unit kesehatan sekolah yang siaga.', 8);

-- ---------------------------------------------------------------
-- Ekstrakurikuler
-- ---------------------------------------------------------------
DELETE FROM extracurriculars;
INSERT INTO extracurriculars (icon, name, sort_order) VALUES
  ('Compass', 'Pramuka', 1),
  ('Megaphone', 'OSIS', 2),
  ('Heart', 'PMR', 3),
  ('Flag', 'Paskibra', 4),
  ('Trophy', 'Basket', 5),
  ('Zap', 'Futsal', 6),
  ('Shield', 'Pencak Silat', 7),
  ('Mic', 'Paduan Suara', 8),
  ('Music', 'Seni Tari Tradisional', 9),
  ('Globe', 'English Debate Club', 10),
  ('Cpu', 'Robotik & Sains Klub', 11),
  ('Camera', 'Jurnalistik & Mading', 12);

-- ---------------------------------------------------------------
-- Prestasi siswa
-- ---------------------------------------------------------------
DELETE FROM achievements;
INSERT INTO achievements (student_name, grade, title, level, icon, sort_order) VALUES
  ('Keisha Ramadhani', 'Kelas XII IPA 1', 'Juara 1 OSN Matematika', 'Tingkat Provinsi 2025', 'Trophy', 1),
  ('Farrel Athallah', 'Kelas XI IPA 2', 'Medali Emas O2SN Pencak Silat', 'Tingkat Nasional 2024', 'Award', 2),
  ('Nadia Putri Anggraini', 'Kelas XII Bahasa', 'Juara 1 Debat Bahasa Inggris', 'Tingkat Nasional 2024', 'Star', 3),
  ('Rizky Ramadhan', 'Kelas XI IPA 1', 'Juara 2 Kompetisi Robotik', 'Tingkat Nasional 2025', 'Trophy', 4),
  ('Salsabila Zahra', 'Kelas XII IPS 1', 'Best Delegate Model United Nations', 'Tingkat Regional 2024', 'Award', 5),
  ('Bagas Adi Nugraha', 'Kelas X IPA 3', 'Juara 1 O2SN Atletik', 'Tingkat Kota 2025', 'Star', 6);

-- ---------------------------------------------------------------
-- Pimpinan sekolah
-- ---------------------------------------------------------------
DELETE FROM leadership;
INSERT INTO leadership (name, role, sort_order) VALUES
  ('Dr. H. Ahmad Sutrisno, M.Pd.', 'Kepala Sekolah', 1),
  ('Dra. Hj. Siti Rahayu, M.Pd.', 'Wakasek Kurikulum', 2),
  ('Budi Santoso, S.Pd., M.M.', 'Wakasek Kesiswaan', 3),
  ('Ir. Hendra Wijaya, M.T.', 'Wakasek Sarana & Prasarana', 4),
  ('Rina Kartika, S.Pd.', 'Wakasek Humas', 5);

-- ---------------------------------------------------------------
-- Guru mata pelajaran
-- ---------------------------------------------------------------
DELETE FROM teachers;
INSERT INTO teachers (name, subject, sort_order) VALUES
  ('Dewi Lestari, S.Pd.', 'Matematika', 1),
  ('Muhammad Fadli, S.Pd.', 'Fisika', 2),
  ('Rina Wulandari, S.Pd.', 'Kimia', 3),
  ('Andi Prasetyo, S.Pd.', 'Biologi', 4),
  ('Fitriani Nur, S.Pd., M.Pd.', 'Bahasa Indonesia', 5),
  ('Robert Simanjuntak, S.S.', 'Bahasa Inggris', 6),
  ('Yusuf Hidayat, S.Pd.', 'Sejarah & PKn', 7),
  ('Maria Angelina, S.Pd.', 'Ekonomi & Geografi', 8),
  ('Dedi Kurniawan, S.Pd.', 'PJOK', 9),
  ('Nur Aisyah, S.Pd.I.', 'Pendidikan Agama Islam', 10);

-- ---------------------------------------------------------------
-- Struktur organisasi
-- ---------------------------------------------------------------
DELETE FROM org_tiers;
INSERT INTO org_tiers (level, names, sort_order) VALUES
  ('Kepala Sekolah', jsonb_build_array('Dr. H. Ahmad Sutrisno, M.Pd.'), 1),
  ('Komite Sekolah', jsonb_build_array('H. Iwan Setiawan'), 2),
  ('Wakil Kepala Sekolah', jsonb_build_array('Kurikulum', 'Kesiswaan', 'Sarana & Prasarana', 'Humas'), 3),
  ('Kepala Tata Usaha', jsonb_build_array('Agus Setiawan, S.E.'), 4),
  ('Guru & Wali Kelas', jsonb_build_array('30+ Tenaga Pengajar'), 5),
  ('Siswa (OSIS & MPK)', jsonb_build_array('850+ Siswa'), 6);

-- ---------------------------------------------------------------
-- Galeri
-- ---------------------------------------------------------------
DELETE FROM gallery;
INSERT INTO gallery (title, icon, sort_order) VALUES
  ('Upacara Bendera', 'Flag', 1),
  ('Praktikum Laboratorium', 'FlaskConical', 2),
  ('Pentas Seni Tahunan', 'Music', 3),
  ('Pertandingan Olahraga', 'Trophy', 4),
  ('Wisuda Purna Siswa', 'GraduationCap', 5),
  ('Kegiatan Pramuka', 'Compass', 6);

-- ---------------------------------------------------------------
-- Testimoni
-- ---------------------------------------------------------------
DELETE FROM testimonials;
INSERT INTO testimonials (name, role, quote, sort_order) VALUES
  ('Aditya Wibowo', 'Alumni Angkatan 2015', 'Bersekolah di Bina Taruna membentuk saya menjadi pribadi yang disiplin dan percaya diri. Bekal karakter yang saya dapat di sini sangat terasa manfaatnya hingga di dunia kerja.', 1),
  ('Lina Marlina', 'Orang Tua Siswa Kelas XI', 'Guru-guru sangat perhatian pada perkembangan anak, bukan hanya nilai akademik tapi juga karakter dan kedisiplinan. Saya tenang menitipkan anak saya di sini.', 2),
  ('Chandra Kusuma', 'Ketua OSIS 2025/2026', 'Banyak sekali ruang untuk berkembang di luar akademik. Saya belajar kepemimpinan, kerja sama tim, dan berani mengambil tanggung jawab sejak kelas X.', 3);

-- ---------------------------------------------------------------
-- PPDB — pengaturan awal. SENGAJA is_open = 0 (tertutup) sebagai
-- default yang aman: admin harus sadar membuka lewat dashboard
-- ("Pengaturan PPDB") setelah meninjau tahun ajaran & jurusan yang
-- tersedia, bukan otomatis menerima pendaftaran publik sejak instalasi
-- pertama. Ganti tahun ajaran di bawah sesuai siklus PPDB sekolah Anda.
-- Jurusan/peminatan sengaja TIDAK di-seed di sini — isi lewat menu
-- "Jurusan/Peminatan PPDB" di dashboard bila sekolah Anda memakainya.
-- ---------------------------------------------------------------
DELETE FROM ppdb_settings WHERE id = 1;
INSERT INTO ppdb_settings (id, academic_year, is_open, closed_message) VALUES
  (1, '2027/2028', 0, 'Pendaftaran peserta didik baru belum dibuka. Silakan cek kembali halaman ini atau hubungi sekolah untuk informasi jadwal PPDB.');
