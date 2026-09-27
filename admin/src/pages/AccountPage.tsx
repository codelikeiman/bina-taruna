import { useState, type FormEvent } from 'react'
import { KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authApi, ApiError } from '../lib/api'
import { useToast } from '../context/ToastContext'

export default function AccountPage() {
  const { admin } = useAuth()
  const { showSuccess, showError } = useToast()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const nextErrors: typeof errors = {}
    if (!currentPassword) nextErrors.currentPassword = 'Wajib diisi.'
    if (newPassword.length < 8) nextErrors.newPassword = 'Password baru minimal 8 karakter.'
    if (confirmPassword !== newPassword) nextErrors.confirmPassword = 'Konfirmasi password tidak sama.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})
    try {
      await authApi.changePassword(currentPassword, newPassword)
      showSuccess('Password berhasil diubah.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400 && !err.fields) {
          setErrors({ currentPassword: err.message })
        } else {
          showError(err.message)
        }
      } else {
        showError('Tidak dapat terhubung ke server.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Akun Saya</h1>
      <p className="mt-1 text-sm text-navy-500 mb-6">Kelola informasi login dashboard admin Anda.</p>

      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-navy-800 uppercase tracking-wide mb-3">Informasi Akun</h2>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-navy-400">Nama</dt>
            <dd className="text-navy-900 font-medium mt-0.5">{admin?.name}</dd>
          </div>
          <div>
            <dt className="text-navy-400">Email</dt>
            <dd className="text-navy-900 font-medium mt-0.5">{admin?.email}</dd>
          </div>
        </dl>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-navy-800 uppercase tracking-wide flex items-center gap-2">
          <KeyRound size={15} />
          Ganti Password
        </h2>

        <div>
          <label className="field-label">Password Saat Ini</label>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={`field-input ${errors.currentPassword ? 'border-maroon-400' : ''}`}
          />
          {errors.currentPassword && <p className="field-error">{errors.currentPassword}</p>}
        </div>

        <div>
          <label className="field-label">Password Baru</label>
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`field-input ${errors.newPassword ? 'border-maroon-400' : ''}`}
          />
          {errors.newPassword && <p className="field-error">{errors.newPassword}</p>}
          {!errors.newPassword && <p className="mt-1.5 text-xs text-navy-400">Minimal 8 karakter.</p>}
        </div>

        <div>
          <label className="field-label">Konfirmasi Password Baru</label>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`field-input ${errors.confirmPassword ? 'border-maroon-400' : ''}`}
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
        </div>

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Menyimpan...' : 'Ubah Password'}
          </button>
        </div>
      </form>
    </div>
  )
}
