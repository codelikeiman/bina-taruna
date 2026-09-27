/**
 * Daftar nama ikon (dari paket "lucide-react") yang boleh dipakai di
 * seluruh konten CMS. Ini SENGAJA berupa daftar tertutup (bukan teks
 * bebas) supaya tidak ada admin yang tanpa sadar menyimpan nama ikon
 * yang tidak ada, yang akan tampil kosong di situs publik.
 *
 * Berisi semua ikon yang sudah dipakai di data contoh, ditambah pilihan
 * umum lain untuk kategori sejenis (pendidikan, olahraga, seni, sains,
 * teknologi, prestasi, komunikasi) supaya admin punya pilihan wajar saat
 * menambah data baru. Daftar ini harus sama persis dengan
 * client/src/lib/icons.jsx di frontend.
 */
export const ICON_NAMES = [
  // Dipakai di data contoh
  'Monitor', 'FlaskConical', 'Cpu', 'BookOpen', 'Dumbbell', 'Landmark', 'Users', 'Heart',
  'Compass', 'Megaphone', 'Flag', 'Trophy', 'Zap', 'Shield', 'Mic', 'Music', 'Globe', 'Camera',
  'Clock', 'GraduationCap', 'Sparkles', 'CheckCircle2', 'Award', 'Star',
  // Pendidikan & akademik
  'PenTool', 'Calculator', 'Library', 'Notebook', 'School', 'Backpack', 'Beaker', 'Atom',
  'Microscope', 'Telescope', 'Languages', 'Brain',
  // Olahraga
  'Bike', 'Volleyball', 'Medal', 'Target', 'Timer', 'Swords',
  // Seni & budaya
  'Palette', 'Theater', 'Drama', 'Guitar', 'Piano', 'Film', 'Brush', 'Feather',
  // Sains & teknologi
  'Rocket', 'Satellite', 'Bot', 'CircuitBoard', 'Code', 'Laptop', 'Wifi',
  // Komunikasi & organisasi
  'MessageCircle', 'Newspaper', 'Radio', 'Handshake', 'Vote', 'Gavel',
  // Umum / lainnya
  'MapPin', 'Building2', 'Leaf', 'Sun', 'Sunrise', 'TreePine', 'Utensils', 'Stethoscope',
  'ShieldCheck', 'Lightbulb', 'Puzzle', 'Flame', 'Crown', 'Gem', 'ThumbsUp', 'Smile',
] as const

export type IconName = (typeof ICON_NAMES)[number]

export const isValidIconName = (value: string): value is IconName =>
  (ICON_NAMES as readonly string[]).includes(value)
