import { MotionConfig } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import About from './components/About'
import VisiMisi from './components/VisiMisi'
import Facilities from './components/Facilities'
import Extracurricular from './components/Extracurricular'
import Achievements from './components/Achievements'
import Teachers from './components/Teachers'
import OrgStructure from './components/OrgStructure'
import Gallery from './components/Gallery'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { useSiteContent } from './hooks/useSiteContent'

function App() {
  const { data, isLoading, error } = useSiteContent()

  if (isLoading) return <SiteLoading />
  if (error || !data) return <SiteError />

  return (
    // reducedMotion="user" membuat semua animasi Framer Motion di bawah ini
    // otomatis menghormati preferensi "prefers-reduced-motion" perangkat pengguna.
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-hidden">
        <Navbar schoolProfile={data.schoolProfile} />
        <main>
          <Hero schoolProfile={data.schoolProfile} />
          <Stats stats={data.stats} />
          <About history={data.history} />
          <VisiMisi visionMission={data.visionMission} />
          <Facilities facilities={data.facilities} />
          <Extracurricular extracurriculars={data.extracurriculars} />
          <Achievements achievements={data.achievements} />
          <Teachers leadership={data.leadership} teachers={data.teachers} />
          <OrgStructure orgStructure={data.orgStructure} />
          <Gallery gallery={data.gallery} />
          <Testimonials testimonials={data.testimonials} />
          <Contact schoolProfile={data.schoolProfile} />
        </main>
        <Footer schoolProfile={data.schoolProfile} />
      </div>
    </MotionConfig>
  )
}

/** Tampil sesaat saat memuat konten dari server pertama kali. */
function SiteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 text-cream-50">
      <div className="flex flex-col items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold-400 text-gold-300 animate-pulse">
          <GraduationCap size={28} strokeWidth={1.75} />
        </span>
        <p className="text-sm text-cream-100/60">Memuat...</p>
      </div>
    </div>
  )
}

/** Tampil bila API backend tidak dapat dihubungi. */
function SiteError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 text-cream-50 px-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-maroon-400 text-maroon-400 mb-5">
          <GraduationCap size={28} strokeWidth={1.75} />
        </span>
        <h1 className="font-display text-xl font-semibold">Situs Tidak Dapat Dimuat</h1>
        <p className="mt-2 text-sm text-cream-100/60 leading-relaxed">
          Tidak dapat terhubung ke server. Pastikan backend berjalan, lalu muat ulang halaman ini.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gold-400 text-navy-950 px-6 py-2.5 font-semibold text-sm hover:bg-gold-300 transition-colors"
        >
          Muat Ulang
        </button>
      </div>
    </div>
  )
}

export default App
