import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { GraduationCap, LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'

export default function LoginPage() {
  const { admin, isLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Sesi masih diperiksa — tunda render supaya tidak sempat menampilkan
  // form login lalu langsung diarahkan pergi begitu pemeriksaan selesai.
  if (isLoading) return null
  if (admin) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Tidak dapat terhubung ke server.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold-400 text-gold-300 mb-4">
            <GraduationCap size={28} strokeWidth={1.75} />
          </span>
          <h1 className="font-display text-2xl font-semibold text-cream-50">Dashboard Admin</h1>
          <p className="mt-1.5 text-sm text-cream-100/60">SMA Bina Taruna — Company Profile</p>
        </div>

        <form onSubmit={handleSubmit} className="card bg-white p-7 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-maroon-50 border border-maroon-100 px-3.5 py-3 text-sm text-maroon-600">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input"
              placeholder="admin@smabinataruna.sch.id"
            />
          </div>

          <div>
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            <LogIn size={16} />
            {submitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
