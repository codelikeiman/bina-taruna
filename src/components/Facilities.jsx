import { motion } from 'framer-motion'
import SectionHeading from './ui/SectionHeading'
import { fadeUp, stagger, viewportOnce } from '../lib/motion'

export default function Facilities({ facilities }) {
  return (
    <section id="fasilitas" className="section-container py-24 md:py-32">
      <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={stagger(0.07)}>
        <SectionHeading
          eyebrow="Fasilitas"
          title="Fasilitas Penunjang Pembelajaran"
          description="Lingkungan belajar yang lengkap, modern, dan nyaman untuk mendukung tumbuh kembang siswa."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="group rounded-2xl border border-navy-100 bg-white p-7 transition-shadow duration-300 hover:shadow-xl hover:shadow-navy-900/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-300 transition-colors duration-300 group-hover:bg-gold-400 group-hover:text-navy-900">
                <f.icon size={22} strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 font-semibold text-navy-900 leading-snug">{f.title}</h3>
              <p className="mt-2 text-sm text-navy-500 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
