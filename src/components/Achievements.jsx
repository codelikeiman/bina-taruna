import { motion } from 'framer-motion'
import SectionHeading from './ui/SectionHeading'
import { fadeUp, stagger, viewportOnce } from '../lib/motion'

export default function Achievements({ achievements }) {
  return (
    <section id="prestasi" className="section-container py-24 md:py-32">
      <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={stagger()}>
        <SectionHeading
          eyebrow="Siswa Berprestasi"
          title="Wajah-Wajah Juara Bina Taruna"
          description="Sebagian kecil dari deretan prestasi siswa di tingkat kota, provinsi, hingga nasional."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((a) => (
            <motion.div
              key={a.name}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="rounded-2xl bg-navy-900 text-cream-50 p-7"
            >
              {a.photoUrl ? (
                <img
                  src={a.photoUrl}
                  alt={a.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gold-400/60"
                  loading="lazy"
                />
              ) : (
                <a.icon className="text-gold-400" size={26} strokeWidth={1.75} />
              )}
              <h3 className="mt-5 font-display text-lg font-semibold leading-snug">{a.title}</h3>
              <p className="mt-1 text-sm text-gold-300">{a.level}</p>
              <div className="mt-6 pt-5 border-t border-cream-50/10">
                <p className="font-semibold text-sm">{a.name}</p>
                <p className="text-xs text-cream-100/60">{a.grade}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
