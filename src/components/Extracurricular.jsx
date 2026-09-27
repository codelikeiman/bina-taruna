import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import { fadeUp, stagger, viewportOnce } from '../lib/motion'

export default function Extracurricular({ extracurriculars }) {
  const [selected, setSelected] = useState(null)

  return (
    <section id="ekskul" className="bg-navy-50/50 py-24 md:py-32">
      <div className="section-container">
        <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={stagger(0.05)}>
          <SectionHeading
            eyebrow="Ekstrakurikuler"
            title="Kembangkan Bakat & Minatmu"
            description="15+ pilihan kegiatan untuk mengasah potensi siswa di luar akademik."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {extracurriculars.map((e) => (
              <motion.button
                key={e.name}
                type="button"
                variants={fadeUp}
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelected(e)}
                className="flex flex-col items-center gap-3 rounded-2xl bg-white border border-navy-100 py-8 px-4 text-center transition-shadow hover:shadow-lg hover:shadow-navy-900/5 cursor-pointer"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900/5 text-navy-800">
                  <e.icon size={24} strokeWidth={1.75} />
                </div>
                <span className="font-medium text-sm text-navy-800">{e.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <ExtracurricularModal ekskul={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

function ExtracurricularModal({ ekskul, onClose }) {
  // Menutup modal dengan tombol Escape, dan mengunci scroll halaman
  // di belakangnya selagi modal terbuka.
  useEffect(() => {
    if (!ekskul) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [ekskul, onClose])

  return (
    <AnimatePresence>
      {ekskul && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ekskul-modal-title"
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy-600 shadow-sm hover:bg-navy-50 hover:text-navy-900"
            >
              <X size={18} />
            </button>

            <div className="p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900/5 text-navy-800">
                <ekskul.icon size={24} strokeWidth={1.75} />
              </div>
              <h3 id="ekskul-modal-title" className="mt-5 font-display text-xl font-semibold text-navy-900">
                {ekskul.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-navy-600 whitespace-pre-line">
                {ekskul.description || 'Belum ada deskripsi untuk ekstrakurikuler ini.'}
              </p>

              {ekskul.imageUrl && (
                <img
                  src={ekskul.imageUrl}
                  alt={ekskul.name}
                  className="mt-6 w-full rounded-xl object-cover max-h-72"
                  loading="lazy"
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
