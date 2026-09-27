import { GraduationCap } from 'lucide-react'

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 text-cream-50">
      <div className="flex flex-col items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold-400 text-gold-300 animate-pulse">
          <GraduationCap size={28} strokeWidth={1.75} />
        </span>
        <p className="text-sm text-cream-100/60">Memuat...</p>
      </div>
    </div>
  )
}

export function PageError({ message = 'Tidak dapat terhubung ke server. Pastikan backend berjalan, lalu muat ulang halaman ini.' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 text-cream-50 px-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-maroon-400 text-maroon-400 mb-5">
          <GraduationCap size={28} strokeWidth={1.75} />
        </span>
        <h1 className="font-display text-xl font-semibold">Halaman Tidak Dapat Dimuat</h1>
        <p className="mt-2 text-sm text-cream-100/60 leading-relaxed">{message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gold-400 text-navy-950 px-6 py-2.5 font-semibold text-sm hover:bg-gold-300 transition-colors"
        >
          Muat Ulang
        </button>
      </div>
    </div>
  )
}
