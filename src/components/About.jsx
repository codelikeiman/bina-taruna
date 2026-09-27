import { motion } from 'framer-motion'
import SectionHeading from './ui/SectionHeading'
import { fadeUp, stagger, viewportOnce } from '../lib/motion'

export default function About({ history }) {
  return (
    <section id="tentang" className="section-container py-24 md:py-32">
      <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={stagger()}>
        <SectionHeading
          eyebrow="Sejarah Kami"
          title="Perjalanan SMA Bina Taruna"
          description="Lebih dari empat dekade mendedikasikan diri untuk pendidikan yang berkualitas."
        />

        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div variants={fadeUp} className="space-y-5">
            {history.paragraphs.map((p, i) => (
              <p key={i} className="text-navy-600 leading-relaxed text-base md:text-lg">
                {p}
              </p>
            ))}
          </motion.div>

          <div className="relative pl-8">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-navy-100" />
            <div className="space-y-10">
              {history.milestones.map((m) => (
                <motion.div key={m.year} variants={fadeUp} className="relative">
                  <span className="absolute -left-8 top-1 h-3.5 w-3.5 rounded-full border-2 border-gold-500 bg-cream-50" />
                  <span className="font-display text-2xl font-semibold text-navy-800">{m.year}</span>
                  <h3 className="mt-1 font-semibold text-navy-900">{m.title}</h3>
                  <p className="mt-1 text-sm text-navy-500 leading-relaxed">{m.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
