import { motion } from 'framer-motion'
import AnimatedCounter from './ui/AnimatedCounter'
import { fadeUp, stagger, viewportOnce } from '../lib/motion'

export default function Stats({ stats }) {
  return (
    <section className="relative -mt-14 md:-mt-16 z-20">
      <div className="section-container">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={stagger(0.08)}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-navy-100 rounded-2xl overflow-hidden shadow-xl shadow-navy-900/10"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="bg-cream-50 px-4 py-8 flex flex-col items-center text-center gap-2">
              <s.icon className="text-gold-500" size={22} strokeWidth={1.75} />
              <span className="font-display text-3xl md:text-4xl font-semibold text-navy-900">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </span>
              <span className="text-xs md:text-[13px] text-navy-500 font-medium leading-tight">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
