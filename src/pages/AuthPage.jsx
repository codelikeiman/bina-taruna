import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion, MotionConfig } from 'framer-motion'
import { Loader2, LogIn, MailCheck, UserPlus } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SectionHeading from '../components/ui/SectionHeading'
import { PageError, PageLoading } from '../components/ppdb/PageStatus'
import { useSiteContent } from '../hooks/useSiteContent'
import { useAuth } from '../context/AuthContext'
import { fadeUp, stagger, viewportOnce } from '../lib/motion'
import { UsersApiError, registerUser, verifyUserCode } from '../lib/usersApi'

const TABS = [
  { key: 'login', label: 'Masuk', Icon: LogIn },
  { key: 'register', label: 'Daftar Akun', Icon: UserPlus },
  { key: 'verify', label: 'Verifikasi Kode', Icon: MailCheck },
]

function Alert({ tone = 'error', children }) {
  if (!children) return null
  const toneClass =
    tone === 'success'
      ? 'bg-emerald-500/10 text-emerald-700'
      : 'bg-maroon-500/10 text-maroon-600'
  return (
    <p className={`mt-5 rounded-lg px-4 py-3 text-sm font-medium ${toneClass}`} role="alert">
      {children}
    </p>
  )
}

function LoginForm({ onSuccess }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login({ email, password })
      onSuccess()
    } catch (err) {
      setError(err instanceof UsersApiError ? err.message : 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="field-label">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
          placeholder="nama@email.com"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="field-label">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input"
          placeholder="Password akun Anda"
        />
      </div>
      <Alert>{error}</Alert>
      <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Masuk...
          </>
        ) : (
          'Masuk'
        )}
      </button>
    </form>
  )
}

function RegisterForm({ onRegistered }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const data = await registerUser({ name, email, password })
      setSuccess(data.message)
      setName('')
      setPassword('')
      onRegistered(email)
    } catch (err) {
      setError(err instanceof UsersApiError ? err.message : 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="reg-name" className="field-label">
          Nama Lengkap
        </label>
        <input
          id="reg-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field-input"
          placeholder="Nama lengkap Anda"
        />
      </div>
      <div>
        <label htmlFor="reg-email" className="field-label">
          Email Aktif
        </label>
        <input
          id="reg-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
          placeholder="nama@email.com"
        />
        <p className="field-hint">Gunakan email yang benar-benar aktif — kode verifikasi akan dikirim ke sini setelah disetujui admin.</p>
      </div>
      <div>
        <label htmlFor="reg-password" className="field-label">
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input"
          placeholder="Minimal 8 karakter"
        />
      </div>
      <Alert>{error}</Alert>
      <Alert tone="success">{success}</Alert>
      <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Mendaftar...
          </>
        ) : (
          'Daftar Akun'
        )}
      </button>
    </form>
  )
}

function VerifyForm({ prefillEmail, onVerified }) {
  const [email, setEmail] = useState(prefillEmail ?? '')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const data = await verifyUserCode({ email, code })
      setSuccess(data.message)
      setCode('')
      onVerified()
    } catch (err) {
      setError(err instanceof UsersApiError ? err.message : 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="verify-email" className="field-label">
          Email
        </label>
        <input
          id="verify-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
          placeholder="nama@email.com"
        />
      </div>
      <div>
        <label htmlFor="verify-code" className="field-label">
          Kode Verifikasi (6 digit)
        </label>
        <input
          id="verify-code"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="field-input tracking-[0.5em] text-center font-semibold text-lg"
          placeholder="000000"
        />
        <p className="field-hint">
          Kode dikirim ke email Anda setelah admin menyetujui pendaftaran akun. Kode berlaku 30 menit.
        </p>
      </div>
      <Alert>{error}</Alert>
      <Alert tone="success">{success}</Alert>
      <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Memverifikasi...
          </>
        ) : (
          'Verifikasi Akun'
        )}
      </button>
    </form>
  )
}

export default function AuthPage() {
  const { data: site, isLoading: siteLoading, error: siteError } = useSiteContent()
  const { isLoggedIn } = useAuth()
  const [tab, setTab] = useState('login')
  const [lastEmail, setLastEmail] = useState('')
  const navigate = useNavigate()

  if (isLoggedIn) return <Navigate to="/ppdb" replace />
  if (siteLoading) return <PageLoading />
  if (siteError || !site) return <PageError />

  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-hidden min-h-screen flex flex-col">
        <Navbar schoolProfile={site.schoolProfile} />
        <main className="flex-1 bg-cream-50 py-20 md:py-28">
          <div className="section-container max-w-lg">
            <motion.div initial="hidden" whileInView="show" viewport={viewportOnce} variants={stagger()}>
              <SectionHeading
                eyebrow="Akun PPDB"
                title="Masuk atau Daftar Akun"
                description="Anda perlu memiliki akun terverifikasi sebelum dapat mengisi formulir Pendaftaran Peserta Didik Baru."
              />
              <motion.div variants={fadeUp} className="rounded-2xl border border-navy-100 bg-white shadow-sm shadow-navy-900/5 p-6 md:p-8">
                <div className="mb-6 grid grid-cols-3 gap-2">
                  {TABS.map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTab(key)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-semibold transition-colors ${
                        tab === key ? 'bg-navy-800 text-cream-50' : 'bg-navy-50 text-navy-500 hover:bg-navy-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {tab === 'login' && <LoginForm onSuccess={() => navigate('/ppdb')} />}
                {tab === 'register' && (
                  <RegisterForm
                    onRegistered={(email) => {
                      setLastEmail(email)
                    }}
                  />
                )}
                {tab === 'verify' && (
                  <VerifyForm prefillEmail={lastEmail} onVerified={() => setTab('login')} />
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
