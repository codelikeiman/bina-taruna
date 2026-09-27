import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, MotionConfig } from 'framer-motion'
import { AlertCircle, Loader2, Search } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionHeading from '../components/ui/SectionHeading'
import PpdbField from '../components/ppdb/PpdbField'
import { PageError, PageLoading } from '../components/ppdb/PageStatus'
import { checkPpdbStatus, PpdbError } from '../lib/ppdbApi'
import { useSiteContent } from '../hooks/useSiteContent'
import { fadeUp, stagger, viewportOnce } from '../lib/motion'

const STATUS_TONE = {
  diajukan: 'bg-navy-100 text-navy-700',
  perlu_revisi: 'bg-maroon-100 text-maroon-700',
  diverifikasi: 'bg-gold-100 text-gold-700',
  terkirim_ke_dinas: 'bg-gold-100 text-gold-700',
  diterima: 'bg-emerald-100 text-emerald-700',
  ditolak: 'bg-maroon-100 text-maroon-700',
}

export default function PpdbStatusPage() {
  const { data: site, isLoading: siteLoading, error: siteError } = useSiteContent()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState({ registrationNumber: searchParams.get('nomor') ?? '', birthDate: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  if (siteLoading) return <PageLoading />
  if (siteError || !site) return <PageError />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    try {
      const data = await checkPpdbStatus(form)
      setResult(data)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setResult(null)
      setErrorMessage(err instanceof PpdbError ? err.message : 'Terjadi kesalahan. Silakan coba lagi.')
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-hidden min-h-screen flex flex-col">
        <Navbar schoolProfile={site.schoolProfile} />
        <main className="flex-1 bg-cream-50 py-20 md:py-28">
          <div className="section-container max-w-lg">
            <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={stagger()}>
              <SectionHeading eyebrow="PPDB" title="Cek Status Pendaftaran" description="Masukkan nomor pendaftaran dan tanggal lahir calon siswa." />

              <motion.form
                variants={fadeUp}
                onSubmit={handleSubmit}
                className="rounded-2xl border border-navy-100 bg-white shadow-sm shadow-navy-900/5 p-6 md:p-8 space-y-5"
              >
                <PpdbField id="registrationNumber" label="Nomor Pendaftaran" required>
                  <input
                    id="registrationNumber"
                    className="field-input uppercase"
                    placeholder="PPDB-2027-XXXXXXXX"
                    value={form.registrationNumber}
                    onChange={(e) => setForm((p) => ({ ...p, registrationNumber: e.target.value }))}
                    required
                  />
                </PpdbField>
                <PpdbField id="birthDate" label="Tanggal Lahir Calon Siswa" required>
                  <input
                    id="birthDate"
                    type="date"
                    className="field-input"
                    value={form.birthDate}
                    onChange={(e) => setForm((p) => ({ ...p, birthDate: e.target.value }))}
                    required
                  />
                </PpdbField>

                {status === 'error' && (
                  <div className="flex items-start gap-2.5 rounded-lg bg-maroon-50 border border-maroon-100 px-4 py-3 text-sm text-maroon-600">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Memeriksa...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" /> Cek Status
                    </>
                  )}
                </button>
              </motion.form>

              {status === 'success' && result && (
                <motion.div
                  variants={fadeUp}
                  className="mt-6 rounded-2xl border border-navy-100 bg-white shadow-sm shadow-navy-900/5 p-6 md:p-8"
                >
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-navy-400 mb-1">
                        {result.registrationNumber}
                      </p>
                      <p className="font-display text-lg text-navy-900">{result.fullName}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_TONE[result.status] ?? 'bg-navy-100 text-navy-700'}`}>
                      {result.statusLabel}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-navy-400">Tahun Ajaran</span>
                      <span className="font-medium text-navy-800">{result.academicYear}</span>
                    </div>
                    {result.majorName && (
                      <div className="flex justify-between">
                        <span className="text-navy-400">Jurusan/Peminatan</span>
                        <span className="font-medium text-navy-800">{result.majorName}</span>
                      </div>
                    )}
                  </div>
                  {result.note && (
                    <div className="mt-4 rounded-lg bg-maroon-50 border border-maroon-100 px-4 py-3 text-sm text-maroon-700">
                      <p className="font-semibold mb-0.5">Catatan dari sekolah:</p>
                      <p>{result.note}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </main>
        <Footer schoolProfile={site.schoolProfile} />
      </div>
    </MotionConfig>
  )
}
