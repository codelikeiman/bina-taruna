/**
 * HARUS sama persis dengan server/src/resources/icons.ts. Daftar ini
 * dipakai untuk memberi admin pilihan ikon lewat dropdown/grid, bukan
 * teks bebas, supaya tidak mungkin mengirim nama ikon yang tidak ada.
 * Backend tetap memvalidasi ulang daftar ini secara independen — daftar
 * di sini murni untuk pengalaman memilih, bukan satu-satunya penjaga.
 */
export const ICON_NAMES = [
  'Monitor', 'FlaskConical', 'Cpu', 'BookOpen', 'Dumbbell', 'Landmark', 'Users', 'Heart',
  'Compass', 'Megaphone', 'Flag', 'Trophy', 'Zap', 'Shield', 'Mic', 'Music', 'Globe', 'Camera',
  'Clock', 'GraduationCap', 'Sparkles', 'CheckCircle2', 'Award', 'Star',
  'PenTool', 'Calculator', 'Library', 'Notebook', 'School', 'Backpack', 'Beaker', 'Atom',
  'Microscope', 'Telescope', 'Languages', 'Brain',
  'Bike', 'Volleyball', 'Medal', 'Target', 'Timer', 'Swords',
  'Palette', 'Theater', 'Drama', 'Guitar', 'Piano', 'Film', 'Brush', 'Feather',
  'Rocket', 'Satellite', 'Bot', 'CircuitBoard', 'Code', 'Laptop', 'Wifi',
  'MessageCircle', 'Newspaper', 'Radio', 'Handshake', 'Vote', 'Gavel',
  'MapPin', 'Building2', 'Leaf', 'Sun', 'Sunrise', 'TreePine', 'Utensils', 'Stethoscope',
  'ShieldCheck', 'Lightbulb', 'Puzzle', 'Flame', 'Crown', 'Gem', 'ThumbsUp', 'Smile',
] as const

export type IconName = (typeof ICON_NAMES)[number]
