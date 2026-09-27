import { motion } from 'framer-motion'
import { fadeUp } from '../../lib/motion'

export default function SectionHeading({ eyebrow, title, description, align = 'center', dark = false }) {
  const alignment = align === 'left' ? 'items-start text-left' : 'items-center text-center'
  return (
    <div className={`flex flex-col ${alignment} gap-4 mb-14 md:mb-20`}>
      {eyebrow && (
        <motion.span variants={fadeUp} className={`eyebrow ${dark ? 'text-gold-300' : 'text-gold-600'}`}>
          <span className="h-px w-8 bg-gold-500" />
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        variants={fadeUp}
        className={`font-display text-3xl md:text-5xl font-semibold leading-tight max-w-2xl ${dark ? 'text-cream-50' : 'text-navy-900'}`}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p variants={fadeUp} className={`max-w-xl text-base md:text-lg leading-relaxed ${dark ? 'text-cream-100/75' : 'text-navy-500'}`}>
          {description}
        </motion.p>
      )}
    </div>
  )
}
