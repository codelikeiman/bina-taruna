import type { ReactNode } from 'react'

/**
 * Pola label+error+hint ini sudah diulang di tiap halaman singleton (mis.
 * SchoolProfilePage.tsx) sebagai komponen lokal — di sini dipusatkan supaya
 * 3 halaman baru modul PPDB (Pengaturan, Pendaftar, Detail) tidak
 * menduplikasinya tiga kali. Tidak mengubah halaman yang sudah ada.
 */
export default function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="field-label">
        {label}
        {required && <span className="text-maroon-400"> *</span>}
      </label>
      {children}
      {error && <p className="field-error">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-navy-400">{hint}</p>}
    </div>
  )
}
