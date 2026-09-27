import { motion } from 'framer-motion'
import SectionHeading from './ui/SectionHeading'
import { fadeUp, stagger, viewportOnce } from '../lib/motion'

const gradients = [
  'from-navy-800 to-navy-950',
  'from-gold-600 to-gold-800',
  'from-maroon-500 to-maroon-600',
  'from-navy-600 to-navy-900',
  'from-gold-600 to-navy-800',
  'from-navy-700 to-maroon-600',
]

export default function Gallery({ gallery }) {
  return (
    <section id="galeri" className="section-container py-24 md:py-32">
      <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={stagger()}>
        <SectionHeading
          eyebrow="Galeri"
          title="Momen di Bina Taruna"
          description="Sekilas dokumentasi kegiatan belajar dan aktivitas siswa sehari-hari."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((g, i) => (
            <motion.div
              key={g.title}
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              className={`group relative aspect-[4/3] rounded-2xl overflow-hidden flex items-end p-6 ${g.photoUrl ? '' : `bg-gradient-to-br ${gradients[i % gradients.length]}`}`}
            >
              {g.photoUrl && (
                <img
                  src={g.photoUrl}
                  alt={g.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              )}
              <div className={`absolute inset-0 transition-colors duration-300 ${g.photoUrl ? 'bg-navy-950/25 group-hover:bg-navy-950/40' : 'bg-navy-950/0 group-hover:bg-navy-950/10'}`} />
              {!g.photoUrl && <g.icon className="absolute top-6 left-6 text-cream-50/25" size={40} strokeWidth={1.2} />}
              <p className="relative font-display text-lg font-semibold text-cream-50">{g.title}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
