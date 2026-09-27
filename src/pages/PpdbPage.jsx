import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, MotionConfig } from 'framer-motion'
import { CalendarClock, LogIn } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionHeading from '../components/ui/SectionHeading'
import PpdbWizard from '../components/ppdb/PpdbWizard'
import PpdbSuccessCard from '../components/ppdb/PpdbSuccessCard'
import { PageError, PageLoading } from '../components/ppdb/PageStatus'
import { useSiteContent } from '../hooks/useSiteContent'
import { usePpdbConfig } from '../hooks/usePpdbConfig'
import { fadeUp, stagger, viewportOnce } from '../lib/motion'
import { fetchMyPpdbStatus } from '../lib/ppdbApi'
import { useAuth } from '../context/AuthContext'

function ClosedNotice({ message }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white shadow-sm shadow-navy-900/5 p-10 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-navy-50">
        <CalendarClock className="h-7 w-7 text-navy-400" />
      </div>
      <h2 className="font-display text-xl text-navy-900 mb-2">Pendaftaran Belum Dibuka</h2>
      <p className="text-navy-500 max-w-md mx-auto leading-relaxed">
        {message || 'Silakan cek kembali halaman ini nanti, atau hubungi sekolah untuk informasi jadwal PPDB.'}
      </p>
    </div>
  )
}

function NeedLoginNotice() {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white shadow-sm shadow-navy-900/5 p-10 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-navy-50">
        <LogIn className="h-7 w-7 text-navy-400" />
      </div>
      <h2 className="font-display text-xl text-navy-900 mb-2">Silakan Masuk Terlebih Dahulu</h2>
      <p className="text-navy-500 max-w-md mx-auto leading-relaxed mb-6">
        Anda perlu memiliki akun terverifikasi sebelum dapat mengisi formulir PPDB. Daftar akun, tunggu persetujuan
        admin, verifikasi kode yang dikirim ke email Anda, lalu masuk.
      </p>
      <Navigate to="/auth" replace />
    </div>
  )
}

export default function PpdbPage() {
  const { data: site, isLoading: siteLoading, error: siteError } = useSiteContent()
  const { settings, majors, isLoading: configLoading, error: configError } = usePpdbConfig()
  const [result, setResult] = useState(null)
  const [existing, setExisting] = useState(undefined) // undefined = belum dicek, null = tidak ada
  const { isLoggedIn, user } = useAuth()

  useEffect(() => {
    if (!isLoggedIn) {
      setExisting(null)
      return
    }
    let cancelled = false
    fetchMyPpdbStatus()
      .then((registration) => {
        if (!cancelled) setExisting(registration)
      })
      .catch(() => {
        if (!cancelled) setExisting(null)
      })
    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

  if (siteLoading || configLoading || (isLoggedIn && existing === undefined)) return <PageLoading />
  if (siteError || !site || configError || !settings) return <PageError />

  // Punya pendaftaran aktif (bukan 'ditolak') — tampilkan status, bukan formulir baru.
  const hasActiveRegistration = existing && existing.status !== 'ditolak'

  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-hidden min-h-screen flex flex-col">
        <Navbar schoolProfile={site.schoolProfile} />
        <main className="flex-1 bg-cream-50 py-20 md:py-28">
          <div className="section-container max-w-3xl">
            <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={stagger()}>
              <SectionHeading
                eyebrow={`Tahun Ajaran ${settings.academicYear}`}
                title="Pendaftaran Peserta Didik Baru"
                description={
                  isLoggedIn && user
                    ? `Masuk sebagai ${user.name}. Isi formulir di bawah ini dengan data yang benar.`
                    : 'Isi formulir di bawah ini dengan data yang benar. Tim sekolah akan memverifikasi berkas Anda sebelum diteruskan ke Dinas Pendidikan.'
                }
              />
              <motion.div variants={fadeUp}>
                {!isLoggedIn ? (
                  <NeedLoginNotice />
                ) : result ? (
                  <PpdbSuccessCard registration={result} />
                ) : hasActiveRegistration ? (
                  <PpdbSuccessCard registration={existing} />
                ) : settings.isOpen ? (
                  <>
                    {existing?.status === 'ditolak' && (
                      <div className="mb-6 rounded-xl border border-maroon-200 bg-maroon-500/5 p-5">
                        <p className="text-sm font-semibold text-maroon-600 mb-1">
                          Pendaftaran sebelumnya (No. {existing.registrationNumber}) tidak diterima.
                        </p>
                        {existing.note && <p className="text-sm text-navy-600">Catatan admin: {existing.note}</p>}
                        <p className="text-sm text-navy-500 mt-1">Anda dapat mengisi formulir pendaftaran baru di bawah ini.</p>
                      </div>
                    )}
                    <PpdbWizard majors={majors} academicYear={settings.academicYear} onSuccess={setResult} />
                  </>
                ) : (
                  <ClosedNotice message={settings.closedMessage} />
                )}
              </motion.div>
            </motion.div>
          </div>
        </main>
        <Footer schoolProfile={site.schoolProfile} />
      </div>
    </MotionConfig>
  )
}
