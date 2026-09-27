import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/**
 * Menyembunyikan 6 digit tengah NIK (bagian yang menyandikan tanggal lahir)
 * secara default — kode wilayah di depan & nomor urut di belakang tetap
 * tampak untuk konteks, tapi bagian paling identitas-spesifik tersembunyi
 * sampai admin sengaja menekan tombol lihat. Mengurangi risiko NIK
 * "kelihatan lewat bahu" (shoulder-surfing) saat layar terbuka di ruang admin.
 */
function maskNik(nik: string): string {
  if (nik.length !== 16) return nik
  return `${nik.slice(0, 6)}${'•'.repeat(6)}${nik.slice(12)}`
}

export default function NikReveal({ nik }: { nik: string }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
      {revealed ? nik : maskNik(nik)}
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="btn-icon !p-1"
        aria-label={revealed ? 'Sembunyikan NIK' : 'Tampilkan NIK'}
      >
        {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </span>
  )
}
