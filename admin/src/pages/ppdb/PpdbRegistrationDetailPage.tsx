import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, Image as ImageIcon } from 'lucide-react'
import { ApiError } from '../../lib/api'
import {
  openPpdbDocument,
  ppdbRegistrationsApi,
  type RegistrationDetail,
  type RegistrationDocument,
  type RegistrationStatus,
} from '../../lib/ppdbApi'
import { useToast } from '../../context/ToastContext'
import StatusBadge from '../../components/ppdb/StatusBadge'
import NikReveal from '../../components/ppdb/NikReveal'
import ConfirmDialog from '../../components/ConfirmDialog'

const GENDER_LABELS: Record<'L' | 'P', string> = { L: 'Laki-laki', P: 'Perempuan' }

const DOC_TYPES: { key: RegistrationDocument['docType']; label: string }[] = [
  { key: 'kk', label: 'Kartu Keluarga (KK)' },
  { key: 'akta', label: 'Akta Kelahiran' },
  { key: 'ijazah', label: 'Ijazah / SKL' },
  { key: 'foto', label: 'Pas Foto' },
]

// Cermin dari STATUS_TRANSITIONS di server (ppdb.registrations.service.ts) —
// hanya menentukan tombol aksi mana yang DITAWARKAN di UI. Validasi
// sesungguhnya tetap di server; daftar ini hanya supaya admin tidak
// disodori tombol yang pasti akan ditolak backend.
const STATUS_TRANSITIONS: Record<RegistrationStatus, RegistrationStatus[]> = {
  diajukan: ['perlu_revisi', 'diverifikasi', 'ditolak'],
  perlu_revisi: ['diverifikasi', 'ditolak'],
  diverifikasi: ['terkirim_ke_dinas', 'perlu_revisi', 'ditolak'],
  terkirim_ke_dinas: ['diterima', 'ditolak'],
  diterima: [],
  ditolak: [],
}

const TRANSITION_META: Record<RegistrationStatus, { label: string; className: string; terminal?: boolean }> = {
  diajukan: { label: 'Tandai Menunggu Verifikasi', className: 'btn-secondary' },
  perlu_revisi: { label: 'Minta Revisi', className: 'btn-secondary hover:!bg-maroon-50 hover:!text-maroon-600' },
  diverifikasi: { label: 'Tandai Terverifikasi', className: 'btn-primary' },
  terkirim_ke_dinas: { label: 'Tandai Terkirim ke Dinas', className: 'btn-primary' },
  diterima: { label: 'Tandai Diterima', className: 'btn-primary', terminal: true },
  ditolak: { label: 'Tandai Tidak Diterima', className: 'btn-danger', terminal: true },
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm border-b border-navy-50 last:border-0">
      <span className="text-navy-400">{label}</span>
      <span className="text-navy-800 font-medium text-right">{value || '—'}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="text-sm font-semibold text-navy-800 uppercase tracking-wide mb-2">{title}</h2>
      {children}
    </section>
  )
}

export default function PpdbRegistrationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const [registration, setRegistration] = useState<RegistrationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState('')
  const [pendingStatus, setPendingStatus] = useState<RegistrationStatus | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<RegistrationStatus | null>(null)
  const [openingDocId, setOpeningDocId] = useState<number | null>(null)

  const registrationId = Number(id)

  const load = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const { registration } = await ppdbRegistrationsApi.get(registrationId)
      setRegistration(registration)
      setNote(registration.adminNote ?? '')
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Gagal memuat data pendaftar.')
    } finally {
      setIsLoading(false)
    }
  }, [registrationId])

  useEffect(() => {
    if (!Number.isFinite(registrationId)) {
      // Guard langsung untuk kasus tepi (id di URL bukan angka) — bukan state
      // turunan yang seharusnya dihitung saat render, jadi tetap wajar
      // ditangani di sini walau linter menandainya.
      // oxlint-disable-next-line react/set-state-in-effect
      setLoadError('ID pendaftaran tidak valid.')
      setIsLoading(false)
      return
    }
    // oxlint-disable-next-line react/set-state-in-effect
    load()
  }, [registrationId, load])

  const applyStatus = async (next: RegistrationStatus) => {
    if ((next === 'perlu_revisi' || next === 'ditolak') && !note.trim()) {
      setNoteError('Catatan wajib diisi untuk status ini, supaya calon siswa/admin lain tahu alasannya.')
      return
    }
    setNoteError('')
    setPendingStatus(next)
    try {
      const { registration: updated } = await ppdbRegistrationsApi.updateStatus(registrationId, next, note)
      setRegistration(updated)
      showSuccess(`Status diubah menjadi "${updated.statusLabel}".`)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields?.note) setNoteError(err.fields.note)
        showError(err.message)
      } else {
        showError('Tidak dapat terhubung ke server.')
      }
    } finally {
      setPendingStatus(null)
      setConfirmTarget(null)
    }
  }

  const handleStatusClick = (next: RegistrationStatus) => {
    if (TRANSITION_META[next].terminal) {
      setConfirmTarget(next)
    } else {
      applyStatus(next)
    }
  }

  const handleViewDocument = async (doc: RegistrationDocument) => {
    setOpeningDocId(doc.id)
    try {
      await openPpdbDocument(registrationId, doc.id)
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Gagal membuka dokumen.')
    } finally {
      setOpeningDocId(null)
    }
  }

  if (isLoading) return <div className="card p-10 text-center text-sm text-navy-400">Memuat data...</div>
  if (loadError || !registration) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm text-maroon-500 mb-3">{loadError ?? 'Data tidak ditemukan.'}</p>
        <button type="button" onClick={() => navigate('/ppdb-registrations')} className="btn-secondary">
          Kembali ke Daftar Pendaftar
        </button>
      </div>
    )
  }

  const availableTransitions = STATUS_TRANSITIONS[registration.status]

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/ppdb-registrations')}
        className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-800 transition-colors mb-4"
      >
        <ArrowLeft size={15} /> Kembali ke Daftar Pendaftar
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-2xl font-semibold text-navy-900">{registration.fullName}</h1>
            <StatusBadge status={registration.status} label={registration.statusLabel} />
          </div>
          <p className="mt-1 text-sm text-navy-500 font-mono">{registration.registrationNumber}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Section title="Data Calon Siswa">
            <InfoRow label="NIK" value={<NikReveal nik={registration.nik} />} />
            <InfoRow label="NISN" value={registration.nisn} />
            <InfoRow label="Tempat, Tanggal Lahir" value={`${registration.birthPlace}, ${registration.birthDate}`} />
            <InfoRow label="Jenis Kelamin" value={GENDER_LABELS[registration.gender]} />
            <InfoRow label="Agama" value={registration.religion} />
            <InfoRow label="No. HP/WhatsApp" value={registration.phone} />
            <InfoRow label="Email" value={registration.email} />
          </Section>

          <Section title="Data Alamat">
            <InfoRow label="Alamat" value={registration.address} />
            <InfoRow label="Provinsi" value={registration.province} />
            <InfoRow label="Kabupaten/Kota" value={registration.city} />
            <InfoRow label="Kecamatan" value={registration.district} />
            <InfoRow label="Kelurahan/Desa" value={registration.village} />
          </Section>

          <Section title="Data Orang Tua/Wali">
            <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide mt-1 mb-1">Ayah</p>
            <InfoRow label="Nama" value={registration.fatherName} />
            <InfoRow label="Pekerjaan" value={registration.fatherJob} />
            <InfoRow label="No. HP/WhatsApp" value={registration.fatherPhone} />
            <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide mt-3 mb-1">Ibu</p>
            <InfoRow label="Nama" value={registration.motherName} />
            <InfoRow label="Pekerjaan" value={registration.motherJob} />
            <InfoRow label="No. HP/WhatsApp" value={registration.motherPhone} />
            {registration.guardianName && (
              <>
                <p className="text-xs font-semibold text-navy-400 uppercase tracking-wide mt-3 mb-1">Wali</p>
                <InfoRow label="Nama" value={registration.guardianName} />
                <InfoRow label="Hubungan" value={registration.guardianRelationship} />
                <InfoRow label="Pekerjaan" value={registration.guardianJob} />
                <InfoRow label="No. HP/WhatsApp" value={registration.guardianPhone} />
              </>
            )}
          </Section>

          <Section title="Pilihan Pendaftaran">
            <InfoRow label="Tahun Ajaran" value={registration.academicYear} />
            {registration.majorName && <InfoRow label="Jurusan/Peminatan" value={registration.majorName} />}
            <InfoRow label="Asal Sekolah" value={registration.previousSchool} />
          </Section>

          <Section title="Dokumen">
            <div className="space-y-2">
              {DOC_TYPES.map(({ key, label }) => {
                const doc = registration.documents.find((d) => d.docType === key)
                return (
                  <div key={key} className="flex items-center justify-between gap-3 py-1.5">
                    <span className="text-sm text-navy-500">{label}</span>
                    {doc ? (
                      <button
                        type="button"
                        onClick={() => handleViewDocument(doc)}
                        disabled={openingDocId === doc.id}
                        className="inline-flex items-center gap-2 text-sm font-medium text-navy-800 hover:text-gold-600 transition-colors disabled:opacity-50"
                      >
                        {doc.mimeType === 'application/pdf' ? <FileText size={15} /> : <ImageIcon size={15} />}
                        <span className="max-w-[220px] truncate">{doc.originalFilename}</span>
                        <span className="text-xs text-navy-400">({formatFileSize(doc.sizeBytes)})</span>
                      </button>
                    ) : (
                      <span className="text-sm text-navy-300">Tidak ada</span>
                    )}
                  </div>
                )
              })}
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Ubah Status">
            <div>
              <label className="field-label">Catatan Admin</label>
              <textarea
                className="field-input resize-y"
                rows={4}
                value={note}
                onChange={(e) => {
                  setNote(e.target.value)
                  if (noteError) setNoteError('')
                }}
                placeholder="Mis. alasan revisi, atau catatan pengiriman ke dinas..."
              />
              {noteError && <p className="field-error">{noteError}</p>}
              <p className="mt-1.5 text-xs text-navy-400">Wajib diisi untuk status "Perlu Revisi" atau "Tidak Diterima".</p>
            </div>

            {availableTransitions.length > 0 ? (
              <div className="mt-4 flex flex-col gap-2">
                {availableTransitions.map((next) => (
                  <button
                    key={next}
                    type="button"
                    onClick={() => handleStatusClick(next)}
                    disabled={pendingStatus !== null}
                    className={TRANSITION_META[next].className}
                  >
                    {pendingStatus === next ? 'Memproses...' : TRANSITION_META[next].label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-navy-400">Status ini final — tidak ada aksi lanjutan.</p>
            )}
          </Section>

          <Section title="Riwayat">
            <InfoRow label="Dikirim" value={formatDateTime(registration.createdAt)} />
            <InfoRow label="Diverifikasi oleh" value={registration.verifiedBy} />
            <InfoRow label="Waktu Verifikasi" value={formatDateTime(registration.verifiedAt)} />
            <InfoRow label="Dikirim ke Dinas oleh" value={registration.sentToDinasBy} />
            <InfoRow label="Waktu Kirim ke Dinas" value={formatDateTime(registration.sentToDinasAt)} />
          </Section>
        </div>
      </div>

      {confirmTarget && (
        <ConfirmDialog
          title={`${TRANSITION_META[confirmTarget].label}?`}
          description="Status ini bersifat final dan tidak bisa diubah lagi lewat dashboard setelah disimpan."
          isSubmitting={pendingStatus !== null}
          onConfirm={() => applyStatus(confirmTarget)}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  )
}
