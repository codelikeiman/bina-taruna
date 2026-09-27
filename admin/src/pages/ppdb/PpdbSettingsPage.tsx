import { useEffect, useState, type FormEvent } from 'react'
import { CalendarClock } from 'lucide-react'
import { ApiError } from '../../lib/api'
import { ppdbSettingsApi, type PpdbSettings } from '../../lib/ppdbApi'
import { useToast } from '../../context/ToastContext'
import Field from '../../components/Field'

const emptySettings: PpdbSettings = { academicYear: '', isOpen: false, closedMessage: '' }

export default function PpdbSettingsPage() {
  const { showSuccess, showError } = useToast()
  const [settings, setSettings] = useState<PpdbSettings>(emptySettings)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    ppdbSettingsApi
      .get()
      .then(({ settings }) => setSettings(settings))
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : 'Gagal memuat pengaturan PPDB.'))
      .finally(() => setIsLoading(false))
  }, [])

  const setField = <K extends keyof PpdbSettings>(key: K, value: PpdbSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setFieldErrors({})
    try {
      const { settings: updated } = await ppdbSettingsApi.update(settings)
      setSettings(updated)
      showSuccess('Pengaturan PPDB berhasil disimpan.')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) setFieldErrors(err.fields)
        showError(err.message)
      } else {
        showError('Tidak dapat terhubung ke server.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="card p-10 text-center text-sm text-navy-400">Memuat data...</div>
  if (loadError) return <div className="card p-10 text-center text-sm text-maroon-500">{loadError}</div>

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Pengaturan PPDB</h1>
      <p className="mt-1 text-sm text-navy-500 mb-6">
        Mengatur tahun ajaran aktif dan apakah formulir pendaftaran ditampilkan ke publik.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <section className="card p-5 space-y-4">
          <button
            type="button"
            onClick={() => setField('isOpen', !settings.isOpen)}
            className={`w-full flex items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors ${
              settings.isOpen ? 'border-gold-300 bg-gold-50' : 'border-navy-100 bg-navy-50/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  settings.isOpen ? 'bg-gold-400 text-navy-950' : 'bg-navy-200 text-navy-500'
                }`}
              >
                <CalendarClock size={18} />
              </span>
              <div>
                <p className="font-semibold text-navy-900">{settings.isOpen ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'}</p>
                <p className="text-xs text-navy-500">
                  {settings.isOpen
                    ? 'Formulir pendaftaran tampil dan bisa diisi publik.'
                    : 'Publik akan melihat pesan bahwa pendaftaran belum/tidak dibuka.'}
                </p>
              </div>
            </div>
            <span
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                settings.isOpen ? 'bg-gold-400' : 'bg-navy-200'
              }`}
              aria-hidden="true"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.isOpen ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </span>
          </button>

          <Field
            label="Tahun Ajaran"
            required
            error={fieldErrors.academicYear}
            hint="Format YYYY/YYYY, mis. 2027/2028. Nilai ini akan tersimpan di setiap pendaftaran baru sebagai catatan periode."
          >
            <input
              className="field-input max-w-xs"
              value={settings.academicYear}
              onChange={(e) => setField('academicYear', e.target.value)}
              placeholder="2027/2028"
              maxLength={20}
            />
          </Field>

          <Field
            label="Pesan Saat Ditutup"
            error={fieldErrors.closedMessage}
            hint="Opsional — ditampilkan ke publik selama pendaftaran belum/tidak dibuka. Kosongkan untuk memakai pesan bawaan."
          >
            <textarea
              className="field-input resize-y"
              rows={3}
              value={settings.closedMessage}
              onChange={(e) => setField('closedMessage', e.target.value)}
              maxLength={500}
            />
          </Field>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={isSaving} className="btn-primary">
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  )
}
