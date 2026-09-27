import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { uploadPhoto, ApiError } from '../lib/api'

interface ImageUploadFieldProps {
  value: string
  onChange: (url: string) => void
  error?: string
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 3 * 1024 * 1024

export default function ImageUploadField({ value, onChange, error }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handlePick = () => inputRef.current?.click()

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // supaya memilih berkas yang sama dua kali tetap memicu onChange
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Format tidak didukung. Gunakan JPG, PNG, atau WEBP.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError('Ukuran berkas maksimal 3 MB.')
      return
    }

    setUploadError(null)
    setUploading(true)
    try {
      const { url } = await uploadPhoto(file)
      onChange(url)
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Gagal mengunggah foto. Coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelected}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center gap-3">
          <img
            src={value}
            alt="Pratinjau foto"
            className="h-16 w-16 rounded-full object-cover border border-navy-100"
          />
          <div className="flex flex-col gap-1.5">
            <button type="button" onClick={handlePick} disabled={uploading} className="btn-secondary text-xs px-3 py-1.5 w-fit">
              {uploading ? 'Mengunggah...' : 'Ganti Foto'}
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={uploading}
              className="flex items-center gap-1 text-xs text-maroon-500 hover:text-maroon-600 w-fit"
            >
              <X size={13} /> Hapus foto
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handlePick}
          disabled={uploading}
          className={`field-input flex items-center justify-center gap-2 text-navy-400 hover:text-navy-600 hover:border-navy-200 ${error || uploadError ? 'border-maroon-400' : ''}`}
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Mengunggah...
            </>
          ) : (
            <>
              <ImagePlus size={16} /> Unggah Foto
            </>
          )}
        </button>
      )}

      {(error || uploadError) && <p className="field-error">{uploadError ?? error}</p>}
    </div>
  )
}
