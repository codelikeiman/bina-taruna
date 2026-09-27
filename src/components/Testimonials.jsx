import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import { fadeUp, stagger, viewportOnce } from '../lib/motion'

export default function Testimonials({ testimonials }) {
  return (
    <section className="bg-navy-50/50 py-24 md:py-32">
      <div className="section-container">
        <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={stagger()}>
          <SectionHeading eyebrow="Testimoni" title="Kata Mereka Tentang Bina Taruna" />
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="rounded-2xl bg-white border border-navy-100 p-8">
                <Quote className="text-gold-300" size={30} strokeWidth={1.5} />
                <p className="mt-4 text-navy-600 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 pt-5 border-t border-navy-50">
                  <p className="font-semibold text-navy-900 text-sm">{t.name}</p>
                  <p className="text-xs text-navy-400">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
