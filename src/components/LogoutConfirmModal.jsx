import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, X } from 'lucide-react'

/** Modal konfirmasi singkat sebelum benar-benar logout. Dipakai dari Navbar (desktop & mobile). */
export default function LogoutConfirmModal({ open, userName, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl shadow-navy-900/20"
          >
            <button
              type="button"
              onClick={onCancel}
              aria-label="Tutup"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-navy-400 hover:bg-navy-50 hover:text-navy-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-maroon-500/10 text-maroon-600">
              <LogOut className="h-5 w-5" />
            </div>

            <h2 id="logout-confirm-title" className="text-center font-display text-lg font-semibold text-navy-900">
              Keluar dari akun?
            </h2>
            <p className="mt-1.5 text-center text-sm text-navy-500 leading-relaxed">
              {userName ? (
                <>
                  Anda akan keluar dari akun <span className="font-medium text-navy-700">{userName}</span>.
                </>
              ) : (
                'Anda perlu masuk kembali untuk mengakses status PPDB Anda.'
              )}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-navy-100 px-4 py-2.5 text-sm font-semibold text-navy-600 hover:bg-navy-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-full bg-maroon-600 px-4 py-2.5 text-sm font-semibold text-cream-50 hover:bg-maroon-700 transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
