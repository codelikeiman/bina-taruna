import * as LucideIcons from 'lucide-react'
import { HelpCircle, type LucideIcon } from 'lucide-react'

/**
 * Mengubah nama ikon (string yang tersimpan di database) menjadi komponen
 * lucide-react yang bisa dirender. Fallback ke HelpCircle bila nama tidak
 * dikenali — seharusnya tidak pernah terjadi karena backend memvalidasi
 * allow-list, tapi tetap dijaga agar UI tidak crash jika suatu saat ada
 * data lama yang menyimpan nama ikon yang sudah tidak ada di daftar.
 */
export function resolveIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>
  return icons[name] ?? HelpCircle
}
