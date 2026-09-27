import { useEffect, useState, type FormEvent } from 'react'
import { schoolProfileApi, ApiError, type SchoolProfile } from '../lib/api'
import { useToast } from '../context/ToastContext'

const emptyProfile: SchoolProfile = {
  name: '',
  short_name: '',
  full_legal_name: '',
  tagline: '',
  motto: '',
  founded_year: new Date().getFullYear(),
  accreditation: '',
  npsn: '',
  email: '',
  phone: '',
  whatsapp: '',
  address_street: '',
  address_area: '',
  address_city: '',
  instagram: '',
  youtube: '',
  facebook: '',
}

export default function SchoolProfilePage() {
  const { showSuccess, showError } = useToast()
  const [profile, setProfile] = useState<SchoolProfile>(emptyProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    schoolProfileApi
      .get()
      .then(({ item }) => setProfile(item))
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : 'Gagal memuat profil sekolah.'))
      .finally(() => setIsLoading(false))
  }, [])

  const setField = <K extends keyof SchoolProfile>(key: K, value: SchoolProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
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
      const { item } = await schoolProfileApi.update(profile)
      setProfile(item)
      showSuccess('Profil sekolah berhasil disimpan.')
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
      <h1 className="font-display text-2xl font-semibold text-navy-900">Profil &amp; Kontak Sekolah</h1>
      <p className="mt-1 text-sm text-navy-500 mb-6">
        Informasi ini tampil di berbagai bagian situs: header, footer, dan halaman kontak.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-navy-800 uppercase tracking-wide">Identitas</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nama Tampilan" required error={fieldErrors.name}>
              <input className="field-input" value={profile.name} onChange={(e) => setField('name', e.target.value)} maxLength={150} />
            </Field>
            <Field label="Nama Singkat" required error={fieldErrors.short_name} hint="Dipakai di ruang sempit, mis. logo mobile.">
              <input className="field-input" value={profile.short_name} onChange={(e) => setField('short_name', e.target.value)} maxLength={150} />
            </Field>
          </div>
          <Field label="Nama Resmi Lengkap" required error={fieldErrors.full_legal_name}>
            <input className="field-input" value={profile.full_legal_name} onChange={(e) => setField('full_legal_name', e.target.value)} maxLength={200} />
          </Field>
          <Field label="Tagline" required error={fieldErrors.tagline} hint="Frasa pendek di bawah nama sekolah.">
            <input className="field-input" value={profile.tagline} onChange={(e) => setField('tagline', e.target.value)} maxLength={200} />
          </Field>
          <Field label="Motto" required error={fieldErrors.motto}>
            <textarea className="field-input resize-y" rows={2} value={profile.motto} onChange={(e) => setField('motto', e.target.value)} maxLength={400} />
          </Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Tahun Berdiri" required error={fieldErrors.founded_year}>
              <input
                type="number"
                className="field-input"
                value={profile.founded_year}
                onChange={(e) => setField('founded_year', Number(e.target.value))}
                min={1900}
                max={new Date().getFullYear()}
              />
            </Field>
            <Field label="Akreditasi" required error={fieldErrors.accreditation}>
              <input className="field-input" value={profile.accreditation} onChange={(e) => setField('accreditation', e.target.value)} maxLength={50} />
            </Field>
            <Field label="NPSN" required error={fieldErrors.npsn}>
              <input className="field-input" value={profile.npsn} onChange={(e) => setField('npsn', e.target.value)} maxLength={30} />
            </Field>
          </div>
        </section>

        <section className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-navy-800 uppercase tracking-wide">Kontak</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Email" required error={fieldErrors.email}>
              <input type="email" className="field-input" value={profile.email} onChange={(e) => setField('email', e.target.value)} maxLength={190} />
            </Field>
            <Field label="Telepon" required error={fieldErrors.phone}>
              <input className="field-input" value={profile.phone} onChange={(e) => setField('phone', e.target.value)} maxLength={50} />
            </Field>
            <Field label="WhatsApp" required error={fieldErrors.whatsapp}>
              <input className="field-input" value={profile.whatsapp} onChange={(e) => setField('whatsapp', e.target.value)} maxLength={50} />
            </Field>
          </div>
          <Field label="Alamat Jalan" required error={fieldErrors.address_street}>
            <input className="field-input" value={profile.address_street} onChange={(e) => setField('address_street', e.target.value)} maxLength={200} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Kelurahan / Kecamatan" required error={fieldErrors.address_area}>
              <input className="field-input" value={profile.address_area} onChange={(e) => setField('address_area', e.target.value)} maxLength={200} />
            </Field>
            <Field label="Kota / Provinsi & Kode Pos" required error={fieldErrors.address_city}>
              <input className="field-input" value={profile.address_city} onChange={(e) => setField('address_city', e.target.value)} maxLength={200} />
            </Field>
          </div>
        </section>

        <section className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-navy-800 uppercase tracking-wide">Media Sosial</h2>
          <p className="text-xs text-navy-400 -mt-2">Opsional — kosongkan bila belum punya akun.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Instagram" error={fieldErrors.instagram}>
              <input className="field-input" value={profile.instagram} onChange={(e) => setField('instagram', e.target.value)} maxLength={100} placeholder="@namaakun" />
            </Field>
            <Field label="YouTube" error={fieldErrors.youtube}>
              <input className="field-input" value={profile.youtube} onChange={(e) => setField('youtube', e.target.value)} maxLength={150} />
            </Field>
            <Field label="Facebook" error={fieldErrors.facebook}>
              <input className="field-input" value={profile.facebook} onChange={(e) => setField('facebook', e.target.value)} maxLength={150} />
            </Field>
          </div>
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

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="field-label">
        {label}
        {required && <span className="text-maroon-400"> *</span>}
      </label>
      {children}
      {error && <p className="field-error">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-navy-400">{hint}</p>}
    </div>
  )
}
