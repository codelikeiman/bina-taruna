import { resolveIcon } from './resolveIcon'

interface DynamicIconProps {
  name: string
  size?: number
  strokeWidth?: number
  className?: string
}

/**
 * Merender ikon lucide-react yang namanya baru diketahui saat runtime
 * (mis. dari database). Dibuat sebagai komponen tersendiri — bukan pola
 * `const Icon = resolveIcon(x); <Icon />` di dalam body komponen lain —
 * supaya jelas bagi pembaca maupun linter bahwa ini murni pencarian
 * referensi komponen yang stabil (lookup), bukan pembuatan komponen baru
 * setiap render.
 */
export function DynamicIcon({ name, size = 18, strokeWidth = 1.75, className }: DynamicIconProps) {
  const Icon = resolveIcon(name)
  // False positive: resolveIcon() is a pure lookup into lucide-react's stable,
  // pre-existing component table, never a factory that defines a new component.
  // This is the single place that pattern lives; every other call site renders
  // <DynamicIcon /> instead of resolving inline.
  // oxlint-disable-next-line react/static-components
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />
}
