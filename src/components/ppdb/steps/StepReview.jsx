import { GENDERS } from '../../../data/ppdbOptions'

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-navy-400">{label}</span>
      <span className="text-navy-800 font-medium text-right">{value}</span>
    </div>
  )
}

function SummaryCard({ title, children }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-5">
      <h4 className="font-display text-base text-navy-900 mb-2">{title}</h4>
      <div className="divide-y divide-navy-50">{children}</div>
    </div>
  )
}

export default function StepReview({ data, files, majors, academicYear, errors, onChange }) {
  const genderLabel = GENDERS.find((g) => g.value === data.gender)?.label
  const majorName = majors.find((m) => String(m.id) === String(data.majorId))?.name

  return (
    <div className="space-y-5">
      <p className="text-sm text-navy-500 -mt-1">Periksa kembali data sebelum mengirim — pastikan semuanya sudah benar.</p>

      <SummaryCard title="Data Calon Siswa">
        <Row label="NIK" value={data.nik} />
        <Row label="NISN" value={data.nisn} />
        <Row label="Nama Lengkap" value={data.fullName} />
        <Row label="Tempat, Tanggal Lahir" value={data.birthPlace && `${data.birthPlace}, ${data.birthDate}`} />
        <Row label="Jenis Kelamin" value={genderLabel} />
        <Row label="Agama" value={data.religion} />
        <Row label="No. HP/WhatsApp" value={data.phone} />
        <Row label="Email" value={data.email} />
      </SummaryCard>

      <SummaryCard title="Data Alamat">
        <Row label="Alamat" value={data.address} />
        <Row label="Provinsi" value={data.province} />
        <Row label="Kabupaten/Kota" value={data.city} />
        <Row label="Kecamatan" value={data.district} />
        <Row label="Kelurahan/Desa" value={data.village} />
      </SummaryCard>

      <SummaryCard title="Data Orang Tua/Wali">
        <Row label="Nama Ayah" value={data.fatherName} />
        <Row label="Pekerjaan Ayah" value={data.fatherJob} />
        <Row label="Nama Ibu" value={data.motherName} />
        <Row label="Pekerjaan Ibu" value={data.motherJob} />
        {data.hasGuardian && (
          <>
            <Row label="Nama Wali" value={data.guardianName} />
            <Row label="Hubungan Wali" value={data.guardianRelationship} />
          </>
        )}
      </SummaryCard>

      <SummaryCard title="Pilihan Pendaftaran">
        <Row label="Tahun Ajaran" value={academicYear} />
        {majorName && <Row label="Jurusan/Peminatan" value={majorName} />}
        <Row label="Asal Sekolah" value={data.previousSchool} />
      </SummaryCard>

      <SummaryCard title="Dokumen">
        <Row label="Kartu Keluarga" value={files.kk?.name} />
        <Row label="Akta Kelahiran" value={files.akta?.name} />
        <Row label="Ijazah/SKL" value={files.ijazah?.name} />
        <Row label="Pas Foto" value={files.foto?.name} />
      </SummaryCard>

      <div className="rounded-xl border border-gold-200 bg-gold-50/50 p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-navy-300 text-gold-500 focus-visible:outline-2 focus-visible:outline-gold-500"
            checked={data.agreementAccepted}
            onChange={(e) => onChange('agreementAccepted', e.target.checked)}
          />
          <span className="text-sm text-navy-700">
            Saya menyatakan bahwa seluruh data dan dokumen yang saya isikan pada formulir ini benar dan dapat
            dipertanggungjawabkan.
          </span>
        </label>
        {errors.agreementAccepted && (
          <p className="field-error" role="alert">
            {errors.agreementAccepted}
          </p>
        )}
      </div>
    </div>
  )
}
