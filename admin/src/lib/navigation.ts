import {
  LayoutDashboard, Building2, Target, Clock, Milestone as MilestoneIcon,
  Monitor, Sparkles, Trophy, GraduationCap, Users, Network, Image as ImageIcon,
  Quote, Mail, KeyRound, ClipboardList, Settings2, BookOpen, UserCog,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Ringkasan',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Identitas Sekolah',
    items: [
      { to: '/school-profile', label: 'Profil & Kontak', icon: Building2 },
      { to: '/vision-mission', label: 'Visi & Misi', icon: Target },
    ],
  },
  {
    label: 'Konten Situs',
    items: [
      { to: '/stats', label: 'Statistik', icon: LayoutDashboard },
      { to: '/history-paragraphs', label: 'Paragraf Sejarah', icon: Clock },
      { to: '/milestones', label: 'Tonggak Sejarah', icon: MilestoneIcon },
      { to: '/facilities', label: 'Fasilitas', icon: Monitor },
      { to: '/extracurriculars', label: 'Ekstrakurikuler', icon: Sparkles },
      { to: '/achievements', label: 'Prestasi Siswa', icon: Trophy },
      { to: '/leadership', label: 'Pimpinan Sekolah', icon: GraduationCap },
      { to: '/teachers', label: 'Guru', icon: Users },
      { to: '/org-tiers', label: 'Struktur Organisasi', icon: Network },
      { to: '/gallery', label: 'Galeri', icon: ImageIcon },
      { to: '/testimonials', label: 'Testimoni', icon: Quote },
    ],
  },
  {
    label: 'PPDB',
    items: [
      { to: '/ppdb-registrations', label: 'Pendaftar', icon: ClipboardList },
      { to: '/ppdb-user-accounts', label: 'Akun Pengguna', icon: UserCog },
      { to: '/ppdb-settings', label: 'Pengaturan PPDB', icon: Settings2 },
      { to: '/ppdb-majors', label: 'Jurusan/Peminatan', icon: BookOpen },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { to: '/contact-messages', label: 'Pesan Masuk', icon: Mail },
      { to: '/account', label: 'Akun Saya', icon: KeyRound },
    ],
  },
]
