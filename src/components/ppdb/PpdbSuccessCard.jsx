import { Link } from 'react-router-dom'
import { CheckCircle2, Copy, Search } from 'lucide-react'
import { useState } from 'react'

export default function PpdbSuccessCard({ registration }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(registration.registrationNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API bisa saja tidak tersedia (mis. http non-secure) — abaikan,
      // nomor pendaftaran sudah tertulis jelas di layar untuk disalin manual.
    }
  }

  return (
    <div className="rounded-2xl border border-navy-100 bg-white shadow-sm shadow-navy-900/5 p-6 md:p-10 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold-50">
        <CheckCircle2 className="h-9 w-9 text-gold-500" />
      </div>
      <h2 className="font-display text-2xl md:text-3xl text-navy-900 mb-2">Pendaftaran Berhasil Dikirim</h2>
      <p className="text-navy-500 mb-7">
        Simpan nomor pendaftaran Anda di bawah ini — dibutuhkan untuk mengecek status di kemudian hari.
      </p>

      <div className="mx-auto max-w-sm rounded-xl border-2 border-dashed border-gold-300 bg-gold-50/40 p-5 mb-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-400 mb-1">Nomor Pendaftaran</p>
        <div className="flex items-center justify-center gap-2">
          <p className="font-display text-xl md:text-2xl text-navy-900 tracking-wide">{registration.registrationNumber}</p>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full p-2 text-navy-400 hover:bg-white hover:text-navy-700 transition-colors"
            aria-label="Salin nomor pendaftaran"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        {copied && <p className="mt-1 text-xs text-gold-600">Tersalin!</p>}
      </div>

      <div className="mx-auto max-w-sm text-left space-y-1.5 mb-8 text-sm">
        <div className="flex justify-between">
          <span className="text-navy-400">Nama</span>
          <span className="font-medium text-navy-800">{registration.fullName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-navy-400">Tahun Ajaran</span>
          <span className="font-medium text-navy-800">{registration.academicYear}</span>
        </div>
        {registration.majorName && (
          <div className="flex justify-between">
            <span className="text-navy-400">Jurusan/Peminatan</span>
            <span className="font-medium text-navy-800">{registration.majorName}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-navy-400">Status</span>
          <span className="inline-flex items-center rounded-full bg-gold-100 px-3 py-0.5 font-medium text-gold-700">
            {registration.statusLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to={`/ppdb/status?nomor=${encodeURIComponent(registration.registrationNumber)}`} className="btn-primary">
          <Search className="h-4 w-4" /> Cek Status Pendaftaran
        </Link>
        <Link to="/" className="btn-outline">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
