import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { fadeUp, stagger, viewportOnce } from '../lib/motion'

export default function VisiMisi({ visionMission }) {
  return (
    <section id="visi-misi" className="bg-navy-900 text-cream-50 py-24 md:py-32">
      <div className="section-container">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={stagger()}
          className="grid lg:grid-cols-[0.9fr_1.1fr] gap-16 items-start"
        >
          <motion.div variants={fadeUp}>
            <span className="eyebrow text-gold-300">
              <span className="h-px w-8 bg-gold-400" />
              Visi & Misi
            </span>
            <h2 className="mt-6 font-display text-3xl md:text-4xl font-semibold leading-tight">Visi Kami</h2>
            <p className="mt-4 text-cream-100/80 text-lg leading-relaxed border-l-2 border-gold-400 pl-6">
              {visionMission.vision}
            </p>
          </motion.div>

          <div>
            <motion.h3 variants={fadeUp} className="font-display text-2xl font-semibold mb-6">
              Misi Kami
            </motion.h3>
            <ul className="space-y-4">
              {visionMission.missions.map((m, i) => (
                <motion.li key={i} variants={fadeUp} className="flex gap-4 items-start">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-gold-400" size={20} />
                  <span className="text-cream-100/85 leading-relaxed">{m}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
