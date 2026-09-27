import { motion } from 'framer-motion'
import SectionHeading from './ui/SectionHeading'
import { fadeUp, stagger, viewportOnce } from '../lib/motion'

// Menghasilkan inisial 2 huruf dari nama bergelar Indonesia
// (mis. "Dr. H. Ahmad Sutrisno, M.Pd." -> "AS") untuk dipakai
// sebagai avatar placeholder, bukan foto asli.
function initials(name) {
  const clean = name
    .replace(/^(Dr\.|Dra\.|Drs\.|Ir\.|Hj\.|H\.)\s*/gi, '')
    .replace(/^(Dr\.|Dra\.|Drs\.|Ir\.|Hj\.|H\.)\s*/gi, '')
    .trim()
  const parts = clean.split(/[\s,]+/).filter(Boolean)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase()
}

const palette = ['bg-navy-800', 'bg-gold-600', 'bg-maroon-500', 'bg-navy-600']

function TeacherCard({ name, subject, photoUrl, index, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'h-24 w-24' : 'h-20 w-20'
  const textClass = size === 'lg' ? 'text-xl' : 'text-lg'
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5 }}
      className="flex flex-col items-center text-center gap-3 rounded-2xl bg-white border border-navy-100 p-6 transition-shadow hover:shadow-lg hover:shadow-navy-900/5"
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className={`${sizeClass} rounded-full object-cover border border-navy-100`}
          loading="lazy"
        />
      ) : (
        <div className={`flex ${sizeClass} ${textClass} items-center justify-center rounded-full text-cream-50 font-display font-semibold ${palette[index % palette.length]}`}>
          {initials(name)}
        </div>
      )}
      <div>
        <p className="font-semibold text-navy-900 text-sm leading-snug">{name}</p>
        <p className="text-xs text-gold-600 font-medium mt-0.5">{subject}</p>
      </div>
    </motion.div>
  )
}

export default function Teachers({ leadership, teachers }) {
  return (
    <section id="guru" className="bg-navy-50/50 py-24 md:py-32">
      <div className="section-container">
        <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={stagger(0.045)}>
          <SectionHeading
            eyebrow="Tenaga Pendidik"
            title="Guru & Pimpinan Sekolah"
            description="Dibimbing oleh tenaga pendidik profesional dan berpengalaman di bidangnya."
          />

          <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-navy-400 mb-6">Pimpinan Sekolah</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 mb-16">
            {leadership.map((t, i) => (
              <TeacherCard key={t.name} name={t.name} subject={t.role} photoUrl={t.photoUrl} index={i} size="lg" />
            ))}
          </div>

          <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-navy-400 mb-6">Guru Mata Pelajaran</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {teachers.map((t, i) => (
              <TeacherCard key={t.name} name={t.name} subject={t.subject} photoUrl={t.photoUrl} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
