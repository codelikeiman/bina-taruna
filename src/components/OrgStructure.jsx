import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import SectionHeading from './ui/SectionHeading'
import { fadeUp, stagger, viewportOnce } from '../lib/motion'

export default function OrgStructure({ orgStructure }) {
  return (
    <section id="struktur" className="section-container py-24 md:py-32">
      <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={stagger()}>
        <SectionHeading
          eyebrow="Struktur Organisasi"
          title="Struktur Kepengurusan Sekolah"
          description="Susunan organisasi yang jelas untuk mendukung tata kelola sekolah yang efektif."
        />

        <div className="flex flex-col items-center gap-3 max-w-3xl mx-auto">
          {orgStructure.tiers.map((tier, i) => (
            <div key={tier.level} className="w-full flex flex-col items-center">
              <motion.div variants={fadeUp} className="w-full">
                <p className="text-center text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-600 mb-3">
                  {tier.level}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {tier.names.map((n) => (
                    <div
                      key={n}
                      className={
                        i === 0
                          ? 'rounded-xl px-8 py-4 text-center min-w-[180px] bg-navy-900 border-2 border-gold-400 shadow-lg shadow-navy-900/20'
                          : 'rounded-xl px-6 py-3.5 text-center min-w-[160px] border border-navy-100 bg-white shadow-sm shadow-navy-900/5'
                      }
                    >
                      <span className={i === 0 ? 'text-sm font-semibold text-cream-50' : 'text-sm font-medium text-navy-800'}>
                        {n}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
              {i < orgStructure.tiers.length - 1 && (
                <motion.div variants={fadeUp} className="my-4 text-navy-200">
                  <ChevronDown size={22} />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
