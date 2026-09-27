import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, GraduationCap } from 'lucide-react'
import { fadeUp, stagger } from '../lib/motion'

export default function Hero({ schoolProfile }) {
  return (
    <section id="beranda" className="relative min-h-screen flex items-center overflow-hidden bg-navy-950 text-cream-50">
      {/* Tekstur titik halus */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
      {/* Cahaya ambient */}
      <div className="absolute -top-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-gold-500/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-navy-500/20 blur-3xl" />

      <div className="section-container relative z-10 grid lg:grid-cols-[1.15fr_0.85fr] gap-16 items-center pt-32 pb-24">
        <motion.div initial="hidden" animate="show" variants={stagger(0.15, 0.15)}>
          <motion.span variants={fadeUp} className="eyebrow text-gold-300">
            <span className="h-px w-8 bg-gold-400" />
            Terakreditasi {schoolProfile.accreditation} · Sejak {schoolProfile.founded}
          </motion.span>

          <motion.h1 variants={fadeUp} className="mt-6 font-display text-5xl md:text-6xl xl:text-7xl font-semibold leading-[1.05]">
            {schoolProfile.name}
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 max-w-lg text-cream-100/80 text-lg leading-relaxed">
            {schoolProfile.motto}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/ppdb"
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 text-navy-950 px-7 py-3.5 font-semibold text-sm tracking-wide transition-all duration-300 hover:bg-gold-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold-500/20"
            >
              Daftar PPDB Sekarang <ArrowRight size={16} />
            </a>
            <a
              href="/#tentang"
              className="inline-flex items-center gap-2 rounded-full border-2 border-cream-50/30 px-7 py-3.5 font-semibold text-sm tracking-wide text-cream-50 transition-all duration-300 hover:border-cream-50/80 hover:-translate-y-0.5"
            >
              Tentang Kami
            </a>
          </motion.div>
        </motion.div>

        {/* Elemen signature: segel berputar ala lambang resmi sekolah */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex justify-center"
        >
          <div className="relative flex h-72 w-72 items-center justify-center">
            <motion.svg
              viewBox="0 0 200 200"
              className="absolute inset-0 h-full w-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 46, repeat: Infinity, ease: 'linear' }}
            >
              <defs>
                <path id="segelPath" d="M 100,100 m -80,0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0" />
              </defs>
              <circle cx="100" cy="100" r="96" fill="none" stroke="#d7a337" strokeOpacity="0.15" />
              <text fill="#e5ba57" fontSize="10.2" letterSpacing="2.6" fontWeight="600">
                <textPath href="#segelPath" startOffset="0%">
                  SMA BINA TARUNA • CERDAS · BERKARAKTER · BERPRESTASI •
                </textPath>
              </text>
            </motion.svg>
            <div className="flex h-44 w-44 items-center justify-center rounded-full border border-gold-400/40 bg-navy-900/60">
              <GraduationCap className="text-gold-300" size={54} strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.a
        href="/#tentang"
        aria-label="Gulir ke bawah"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cream-50/60 hover:text-cream-50 transition-colors"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown size={28} />
      </motion.a>
    </section>
  )
}
