import type { RegistrationStatus } from '../../lib/ppdbApi'

const TONE: Record<RegistrationStatus, string> = {
  diajukan: 'bg-navy-100 text-navy-700',
  perlu_revisi: 'bg-maroon-500/10 text-maroon-600',
  diverifikasi: 'bg-gold-100 text-gold-700',
  terkirim_ke_dinas: 'bg-navy-800 text-cream-50',
  diterima: 'bg-gold-500 text-cream-50',
  ditolak: 'bg-maroon-600 text-cream-50',
}

export default function StatusBadge({ status, label }: { status: RegistrationStatus; label: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${TONE[status]}`}>
      {label}
    </span>
  )
}
