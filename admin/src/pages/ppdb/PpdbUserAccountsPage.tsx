import { useCallback, useEffect, useState } from 'react'
import { MailCheck, RefreshCw, UserCog, UserCheck } from 'lucide-react'
import { ApiError } from '../../lib/api'
import { usersAdminApi, type UserAccountListItem, type UserAccountStatus } from '../../lib/usersApi'
import { useToast } from '../../context/ToastContext'

const STATUS_OPTIONS: { value: UserAccountStatus | ''; label: string }[] = [
  { value: '', label: 'Semua Status' },
  { value: 'pending_admin_approval', label: 'Menunggu Persetujuan' },
  { value: 'pending_verification', label: 'Menunggu Verifikasi User' },
  { value: 'verified', label: 'Terverifikasi' },
]

const STATUS_TONE: Record<UserAccountStatus, string> = {
  pending_admin_approval: 'bg-maroon-500/10 text-maroon-600',
  pending_verification: 'bg-gold-100 text-gold-700',
  verified: 'bg-gold-500 text-cream-50',
}

const STATUS_LABEL: Record<UserAccountStatus, string> = {
  pending_admin_approval: 'Menunggu Persetujuan',
  pending_verification: 'Menunggu Verifikasi User',
  verified: 'Terverifikasi',
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function PpdbUserAccountsPage() {
  const { showSuccess, showError } = useToast()
  const [items, setItems] = useState<UserAccountListItem[]>([])
  const [status, setStatus] = useState<UserAccountStatus | ''>('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  // Melacak baris mana yang sedang diproses (approve/resend) supaya tombolnya
  // saja yang nonaktif — bukan seluruh tabel — dan supaya dua aksi berbeda
  // pada baris yang sama tidak bisa tertumpuk tak sengaja.
  const [pendingAction, setPendingAction] = useState<{ id: number; action: 'approve' | 'resend' } | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const result = await usersAdminApi.list(status || undefined)
      setItems(result.items)
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Gagal memuat data akun pengguna.')
    } finally {
      setIsLoading(false)
    }
  }, [status])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load()
  }, [load])

  const handleApprove = async (item: UserAccountListItem) => {
    if (!window.confirm(`Setujui akun "${item.name}" dan kirim kode verifikasi ke ${item.email}?`)) return
    setPendingAction({ id: item.id, action: 'approve' })
    try {
      const result = await usersAdminApi.approve(item.id)
      showSuccess(result.message)
      await load()
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Gagal menyetujui akun.')
    } finally {
      setPendingAction(null)
    }
  }

  const handleResend = async (item: UserAccountListItem) => {
    if (!window.confirm(`Kirim ulang kode verifikasi baru ke ${item.email}?`)) return
    setPendingAction({ id: item.id, action: 'resend' })
    try {
      const result = await usersAdminApi.resendCode(item.id)
      showSuccess(result.message)
      await load()
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Gagal mengirim ulang kode.')
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Akun Pengguna PPDB</h1>
          <p className="mt-1 text-sm text-navy-500">
            Kelola akun calon siswa/orang tua yang mendaftar. Setujui akun untuk mengirim kode verifikasi ke email mereka.
          </p>
        </div>
      </div>

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <select
          className="field-input w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value as UserAccountStatus | '')}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <div className="card p-10 text-center text-sm text-navy-400">Memuat data...</div>}

      {!isLoading && loadError && (
        <div className="card p-10 text-center">
          <p className="text-sm text-maroon-500 mb-3">{loadError}</p>
          <button type="button" onClick={load} className="btn-secondary">Coba Lagi</button>
        </div>
      )}

      {!isLoading && !loadError && items.length === 0 && (
        <div className="card p-12 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-300 mb-3">
            <UserCog size={22} />
          </span>
          <p className="text-sm text-navy-500">Belum ada akun pengguna yang cocok dengan filter ini.</p>
        </div>
      )}

      {!isLoading && !loadError && items.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-left text-xs font-semibold uppercase tracking-wide text-navy-400">
                  <th className="px-5 py-3">Nama</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Terdaftar</th>
                  <th className="px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {items.map((item) => {
                  const isBusyApprove = pendingAction?.id === item.id && pendingAction.action === 'approve'
                  const isBusyResend = pendingAction?.id === item.id && pendingAction.action === 'resend'
                  const isAnyBusy = pendingAction?.id === item.id
                  return (
                    <tr key={item.id}>
                      <td className="px-5 py-3.5 font-medium text-navy-900">{item.name}</td>
                      <td className="px-5 py-3.5 text-navy-600">{item.email}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_TONE[item.status]}`}>
                          {STATUS_LABEL[item.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-navy-500">{formatDate(item.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        {item.status === 'pending_admin_approval' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(item)}
                            disabled={isAnyBusy}
                            className="btn-secondary !py-1.5 !px-3 text-xs"
                          >
                            <UserCheck size={14} /> {isBusyApprove ? 'Memproses...' : 'Setujui & Kirim Kode'}
                          </button>
                        )}
                        {item.status === 'pending_verification' && (
                          <button
                            type="button"
                            onClick={() => handleResend(item)}
                            disabled={isAnyBusy}
                            className="btn-secondary !py-1.5 !px-3 text-xs"
                          >
                            <RefreshCw size={14} /> {isBusyResend ? 'Mengirim...' : 'Kirim Ulang Kode'}
                          </button>
                        )}
                        {item.status === 'verified' && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-navy-400">
                            <MailCheck size={14} /> Sudah terverifikasi
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
