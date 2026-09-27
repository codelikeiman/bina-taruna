import { useEffect, useRef, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Input unggah satu berkas dengan preview. Validasi format/ukuran yang
 * SESUNGGUHNYA (magic bytes) tetap dilakukan server — `accept` di sini
 * hanya penyaring awal di sisi browser supaya orang tidak salah pilih
 * berkas, bukan lapisan keamanan (lihat ppdb.documents.ts di backend).
 */
export default function FileUploadField({ id, label, required, hint, accept, file, onChange, error }) {
  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      // Menyinkronkan state React dengan resource eksternal (Object URL milik
      // browser) yang butuh dibuat & dibersihkan mengikuti siklus hidup `file`
      // — ini justru kasus yang React sendiri sarankan memakai efek (tidak
      // bisa dihitung murni saat render, karena butuh cleanup/revoke saat
      // `file` berganti atau komponen unmount). Bukan state turunan yang
      // seharusnya dihindari lewat efek.
      // oxlint-disable-next-line react/set-state-in-effect
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl(null)
  }, [file])

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="text-maroon-500"> *</span>}
      </label>

      <div
        className={`rounded-lg border-2 border-dashed p-4 transition-colors ${
          error ? 'border-maroon-400 bg-maroon-500/5' : 'border-navy-200 hover:border-gold-400'
        }`}
      >
        {file ? (
          <div className="flex items-center gap-3">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="h-14 w-14 rounded-md object-cover border border-navy-100" />
            ) : (
              <div className="h-14 w-14 rounded-md bg-navy-50 flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6 text-navy-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-navy-800 truncate">{file.name}</p>
              <p className="text-xs text-navy-400">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                onChange(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
              className="shrink-0 rounded-full p-1.5 text-navy-400 hover:bg-navy-50 hover:text-maroon-500 transition-colors"
              aria-label={`Hapus berkas ${label}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center gap-3 text-left"
          >
            <div className="h-10 w-10 rounded-md bg-gold-50 flex items-center justify-center shrink-0">
              <Upload className="h-5 w-5 text-gold-600" />
            </div>
            <span className="text-sm text-navy-500">
              Ketuk untuk memilih berkas <span className="text-navy-400">(maks. 2 MB)</span>
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>

      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  )
}
