import * as LucideIcons from 'lucide-react'
import { HelpCircle } from 'lucide-react'

/**
 * Mengubah nama ikon (string dari API) menjadi komponen lucide-react yang
 * bisa dirender langsung sebagai `<Icon />`, mempertahankan bentuk yang
 * dulunya dipakai schoolData.js statis (icon: IconComponent) supaya
 * komponen di src/components/ tidak perlu diubah.
 */
export function resolveIcon(name) {
  return LucideIcons[name] ?? HelpCircle
}
