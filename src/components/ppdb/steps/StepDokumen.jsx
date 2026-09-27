import FileUploadField from '../FileUploadField'

const IMAGE_AND_PDF = 'image/jpeg,image/png,application/pdf'
const IMAGE_ONLY = 'image/jpeg,image/png'

export default function StepDokumen({ files, errors, onFileChange }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-navy-500 -mt-1">
        Format JPG, PNG, atau PDF (Pas Foto khusus JPG/PNG), maksimal 2 MB per berkas.
      </p>

      <FileUploadField
        id="kk"
        label="Kartu Keluarga (KK)"
        required
        accept={IMAGE_AND_PDF}
        file={files.kk}
        onChange={(f) => onFileChange('kk', f)}
        error={errors.kk}
      />
      <FileUploadField
        id="akta"
        label="Akta Kelahiran"
        required
        accept={IMAGE_AND_PDF}
        file={files.akta}
        onChange={(f) => onFileChange('akta', f)}
        error={errors.akta}
      />
      <FileUploadField
        id="ijazah"
        label="Ijazah / SKL"
        required
        accept={IMAGE_AND_PDF}
        file={files.ijazah}
        onChange={(f) => onFileChange('ijazah', f)}
        error={errors.ijazah}
        hint="Surat Keterangan Lulus juga bisa dipakai bila ijazah belum terbit"
      />
      <FileUploadField
        id="foto"
        label="Pas Foto"
        required
        accept={IMAGE_ONLY}
        file={files.foto}
        onChange={(f) => onFileChange('foto', f)}
        error={errors.foto}
        hint="Foto terbaru, latar polos"
      />
    </div>
  )
}
