import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Download, Search, Users } from 'lucide-react'
import { ApiError, resourceApi } from '../../lib/api'
import { ppdbRegistrationsApi, exportPpdbRegistrationsCsv, type RegistrationListItem, type RegistrationStatus } from '../../lib/ppdbApi'
import { useToast } from '../../context/ToastContext'
import StatusBadge from '../../components/ppdb/StatusBadge'

const STATUS_OPTIONS: { value: RegistrationStatus | ''; label: string }[] = [
  { value: '', label: 'Semua Status' },
  { value: 'diajukan', label: 'Menunggu Verifikasi' },
  { value: 'perlu_revisi', label: 'Perlu Revisi' },
  { value: 'diverifikasi', label: 'Terverifikasi' },
  { value: 'terkirim_ke_dinas', label: 'Terkirim ke Dinas' },
  { value: 'diterima', label: 'Diterima' },
  { value: 'ditolak', label: 'Tidak Diterima' },
]
const VALID_STATUSES = new Set<string>(STATUS_OPTIONS.map((o) => o.value).filter(Boolean))

const PAGE_SIZE = 20

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { dateStyle: 'medium' })
  } catch {
    return iso
  }
}

export default function PpdbRegistrationsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showError } = useToast()

  const [items, setItems] = useState<RegistrationListItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState<RegistrationStatus | ''>(() => {
    // Mendukung tautan langsung ke status tertentu, mis. dari banner
    // "pendaftar menunggu verifikasi" di Dashboard (?status=diajukan).
    const fromUrl = searchParams.get('status')
    return fromUrl && VALID_STATUSES.has(fromUrl) ? (fromUrl as RegistrationStatus) : ''
  })
  const [majorId, setMajorId] = useState<number | ''>('')
  const [search, setSearch] = useState('')
  const [majors, setMajors] = useState<{ id: number; name: string }[]>([])

  // Debounce input pencarian bebas — filter status/jurusan (dropdown) sudah
  // diskrit jadi tidak perlu didebounce, tapi mengetik nama/nomor pendaftaran
  // per-karakter akan memicu request berlebihan tanpa ini.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    resourceApi
      .list('ppdb-majors')
      .then(({ items }) => setMajors(items as unknown as { id: number; name: string }[]))
      .catch(() => setMajors([]))
  }, [])

  const load = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const result = await ppdbRegistrationsApi.list({ page, pageSize: PAGE_SIZE, status, majorId, search })
      setItems(result.items)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Gagal memuat data pendaftar.')
    } finally {
      setIsLoading(false)
    }
  }, [page, status, majorId, search])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load()
  }, [load])

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportPpdbRegistrationsCsv({ status, majorId, search })
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Gagal mengekspor data.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">Pendaftar PPDB</h1>
          <p className="mt-1 text-sm text-navy-500">{total > 0 ? `${total} pendaftar ditemukan.` : 'Daftar calon siswa yang mengisi formulir PPDB.'}</p>
        </div>
        <button type="button" onClick={handleExport} disabled={isExporting || total === 0} className="btn-secondary">
          <Download size={16} /> {isExporting ? 'Mengekspor...' : 'Ekspor CSV'}
        </button>
      </div>

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
          <input
            className="field-input !pl-9"
            placeholder="Cari nama, NISN, atau nomor pendaftaran..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select
          className="field-input w-auto"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as RegistrationStatus | '')
            setPage(1)
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {majors.length > 0 && (
          <select
            className="field-input w-auto"
            value={majorId}
            onChange={(e) => {
              setMajorId(e.target.value ? Number(e.target.value) : '')
              setPage(1)
            }}
          >
            <option value="">Semua Jurusan</option>
            {majors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        )}
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
            <Users size={22} />
          </span>
          <p className="text-sm text-navy-500">Belum ada pendaftar yang cocok dengan filter ini.</p>
        </div>
      )}

      {!isLoading && !loadError && items.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-left text-xs font-semibold uppercase tracking-wide text-navy-400">
                  <th className="px-5 py-3">Nomor Pendaftaran</th>
                  <th className="px-5 py-3">Nama</th>
                  <th className="px-5 py-3">Jurusan</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Tgl Daftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/ppdb-registrations/${item.id}`)}
                    className="cursor-pointer transition-colors hover:bg-navy-50/60"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-navy-500 whitespace-nowrap">{item.registrationNumber}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-navy-900">{item.fullName}</p>
                      <p className="text-xs text-navy-400">{item.nisn}</p>
                    </td>
                    <td className="px-5 py-3.5 text-navy-600">{item.majorName ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.status} label={item.statusLabel} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-navy-500">{formatDate(item.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 border-t border-navy-100 px-5 py-3.5">
              <p className="text-xs text-navy-400">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="btn-icon">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="btn-icon">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
