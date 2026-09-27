import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Send } from 'lucide-react'
import StepSiswa from './steps/StepSiswa'
import StepAlamat from './steps/StepAlamat'
import StepOrtuWali from './steps/StepOrtuWali'
import StepPendaftaran from './steps/StepPendaftaran'
import StepDokumen from './steps/StepDokumen'
import StepReview from './steps/StepReview'
import { FIELD_STEP_MAP, validateStep } from './validation'
import { PpdbError, submitPpdbRegistration } from '../../lib/ppdbApi'

const DRAFT_KEY = 'ppdb-draft-v1'

const INITIAL_DATA = {
  nik: '',
  nisn: '',
  fullName: '',
  birthPlace: '',
  birthDate: '',
  gender: '',
  religion: '',
  phone: '',
  email: '',
  address: '',
  province: '',
  city: '',
  district: '',
  village: '',
  fatherName: '',
  fatherJob: '',
  fatherPhone: '',
  motherName: '',
  motherJob: '',
  motherPhone: '',
  hasGuardian: false,
  guardianName: '',
  guardianRelationship: '',
  guardianJob: '',
  guardianPhone: '',
  majorId: '',
  previousSchool: '',
  agreementAccepted: false,
}

const STEPS = [
  { title: 'Data Calon Siswa', Component: StepSiswa },
  { title: 'Data Alamat', Component: StepAlamat },
  { title: 'Data Orang Tua/Wali', Component: StepOrtuWali },
  { title: 'Pilihan Pendaftaran', Component: StepPendaftaran },
  { title: 'Dokumen Persyaratan', Component: StepDokumen },
  { title: 'Review & Kirim', Component: StepReview },
]

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return { ...INITIAL_DATA, ...parsed }
  } catch {
    return null
  }
}

export default function PpdbWizard({ majors, academicYear, onSuccess }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(() => loadDraft() ?? INITIAL_DATA)
  const [files, setFiles] = useState({ kk: null, akta: null, ijazah: null, foto: null })
  const [website, setWebsite] = useState('') // honeypot — lihat komentar di dekat <input> di bawah
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hasDraft, setHasDraft] = useState(() => Boolean(loadDraft()))
  const topRef = useRef(null)

  // Simpan draf ke localStorage (didebounce 500ms) supaya isian tidak hilang
  // kalau tab tak sengaja tertutup/refresh. Berkas TIDAK ikut disimpan (File
  // tidak bisa diserialisasi) — hanya field teks.
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
      setHasDraft(true)
    }, 500)
    return () => clearTimeout(timeout)
  }, [data])

  const updateField = (name, value) => {
    setData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const updateFile = (name, file) => {
    setFiles((prev) => ({ ...prev, [name]: file }))
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const goNext = () => {
    const stepErrors = validateStep(step, data, files, majors)
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }))
      return
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
      scrollToTop()
    }
  }

  const goBack = () => {
    if (step > 0) {
      setStep((s) => s - 1)
      scrollToTop()
    }
  }

  const clearDraft = () => {
    if (!window.confirm('Hapus draf yang tersimpan di perangkat ini? Isian pada formulir akan dikosongkan.')) return
    localStorage.removeItem(DRAFT_KEY)
    setData(INITIAL_DATA)
    setFiles({ kk: null, akta: null, ijazah: null, foto: null })
    setErrors({})
    setStep(0)
    setHasDraft(false)
  }

  const handleSubmit = async () => {
    const stepErrors = validateStep(5, data, files, majors)
    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }))
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = {
        ...data,
        hasGuardian: data.hasGuardian ? 'true' : 'false',
        agreementAccepted: data.agreementAccepted ? 'true' : 'false',
        website,
      }
      const registration = await submitPpdbRegistration(payload, files)
      localStorage.removeItem(DRAFT_KEY)
      onSuccess(registration)
    } catch (err) {
      if (err instanceof PpdbError && err.fields) {
        setErrors((prev) => ({ ...prev, ...err.fields }))
        const erroredSteps = Object.keys(err.fields).map((f) => FIELD_STEP_MAP[f] ?? 5)
        setStep(Math.min(...erroredSteps, 5))
        scrollToTop()
      } else {
        setSubmitError(err.message ?? 'Terjadi kesalahan. Silakan coba lagi.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const CurrentStep = STEPS[step].Component
  const isLastStep = step === STEPS.length - 1
  const progressPct = ((step + 1) / STEPS.length) * 100

  return (
    <div ref={topRef} className="rounded-2xl border border-navy-100 bg-white shadow-sm shadow-navy-900/5 p-6 md:p-8">
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-sm font-semibold text-navy-800">
            Langkah {step + 1} dari {STEPS.length} — {STEPS[step].title}
          </p>
          {hasDraft && (
            <button type="button" onClick={clearDraft} className="text-xs text-navy-400 hover:text-maroon-500 transition-colors">
              Hapus draf
            </button>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-navy-100 overflow-hidden">
          <div className="h-full rounded-full bg-gold-400 transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <CurrentStep
        data={data}
        errors={errors}
        onChange={updateField}
        files={files}
        onFileChange={updateFile}
        majors={majors}
        academicYear={academicYear}
      />

      {/* Honeypot anti-bot: field ini disembunyikan secara visual & tidak
          bisa dijangkau lewat Tab, tapi tetap ada di DOM supaya bot yang
          otomatis mengisi semua input akan mengisinya. Pengguna asli tidak
          akan pernah melihat/mengisi ini. Server menolak submit bila terisi. */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {submitError && (
        <p className="mt-5 rounded-lg bg-maroon-500/10 px-4 py-3 text-sm font-medium text-maroon-600" role="alert">
          {submitError}
        </p>
      )}

      <div className="mt-7 flex items-center justify-between gap-4 border-t border-navy-100 pt-6">
        <button type="button" onClick={goBack} disabled={step === 0} className="btn-outline !px-5 !py-2.5 text-sm">
          <ChevronLeft className="h-4 w-4" /> Kembali
        </button>

        {isLastStep ? (
          <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary !px-6 !py-2.5 text-sm">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Mengirim...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Kirim Pendaftaran
              </>
            )}
          </button>
        ) : (
          <button type="button" onClick={goNext} className="btn-primary !px-6 !py-2.5 text-sm">
            Lanjut <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
