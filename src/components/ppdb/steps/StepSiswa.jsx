import PpdbField from '../PpdbField'
import { GENDERS, RELIGIONS } from '../../../data/ppdbOptions'

const onlyDigits = (value) => value.replace(/\D/g, '')

export default function StepSiswa({ data, errors, onChange }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <PpdbField id="nik" label="NIK" required error={errors.nik} hint="16 digit sesuai Kartu Keluarga">
          <input
            id="nik"
            className="field-input"
            inputMode="numeric"
            maxLength={16}
            placeholder="3201xxxxxxxxxxxx"
            value={data.nik}
            onChange={(e) => onChange('nik', onlyDigits(e.target.value))}
          />
        </PpdbField>
        <PpdbField id="nisn" label="NISN" required error={errors.nisn} hint="10 digit, lihat di rapor/ijazah SMP">
          <input
            id="nisn"
            className="field-input"
            inputMode="numeric"
            maxLength={10}
            placeholder="00xxxxxxxx"
            value={data.nisn}
            onChange={(e) => onChange('nisn', onlyDigits(e.target.value))}
          />
        </PpdbField>
      </div>

      <PpdbField id="fullName" label="Nama Lengkap" required error={errors.fullName}>
        <input
          id="fullName"
          className="field-input"
          placeholder="Sesuai akta kelahiran"
          value={data.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
        />
      </PpdbField>

      <div className="grid gap-5 sm:grid-cols-2">
        <PpdbField id="birthPlace" label="Tempat Lahir" required error={errors.birthPlace}>
          <input
            id="birthPlace"
            className="field-input"
            value={data.birthPlace}
            onChange={(e) => onChange('birthPlace', e.target.value)}
          />
        </PpdbField>
        <PpdbField id="birthDate" label="Tanggal Lahir" required error={errors.birthDate}>
          <input
            id="birthDate"
            type="date"
            className="field-input"
            value={data.birthDate}
            onChange={(e) => onChange('birthDate', e.target.value)}
          />
        </PpdbField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <PpdbField id="gender" label="Jenis Kelamin" required error={errors.gender}>
          <select id="gender" className="field-input" value={data.gender} onChange={(e) => onChange('gender', e.target.value)}>
            <option value="">Pilih jenis kelamin</option>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </PpdbField>
        <PpdbField id="religion" label="Agama" required error={errors.religion}>
          <select id="religion" className="field-input" value={data.religion} onChange={(e) => onChange('religion', e.target.value)}>
            <option value="">Pilih agama</option>
            {RELIGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </PpdbField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <PpdbField id="phone" label="Nomor HP/WhatsApp" required error={errors.phone} hint="Aktif, untuk dihubungi sekolah">
          <input
            id="phone"
            type="tel"
            className="field-input"
            placeholder="08xxxxxxxxxx"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value.replace(/[^\d+]/g, ''))}
          />
        </PpdbField>
        <PpdbField id="email" label="Email" required error={errors.email}>
          <input
            id="email"
            type="email"
            className="field-input"
            placeholder="nama@email.com"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
          />
        </PpdbField>
      </div>
    </div>
  )
}
