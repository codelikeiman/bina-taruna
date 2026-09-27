import PpdbField from '../PpdbField'
import { PROVINCES } from '../../../data/ppdbOptions'

export default function StepAlamat({ data, errors, onChange }) {
  return (
    <div className="space-y-5">
      <PpdbField id="address" label="Alamat Lengkap" required error={errors.address} hint="Nama jalan, RT/RW, nomor rumah">
        <textarea
          id="address"
          rows={3}
          className="field-input resize-none"
          value={data.address}
          onChange={(e) => onChange('address', e.target.value)}
        />
      </PpdbField>

      <PpdbField id="province" label="Provinsi" required error={errors.province}>
        <select id="province" className="field-input" value={data.province} onChange={(e) => onChange('province', e.target.value)}>
          <option value="">Pilih provinsi</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </PpdbField>

      <div className="grid gap-5 sm:grid-cols-2">
        <PpdbField id="city" label="Kabupaten/Kota" required error={errors.city}>
          <input id="city" className="field-input" value={data.city} onChange={(e) => onChange('city', e.target.value)} />
        </PpdbField>
        <PpdbField id="district" label="Kecamatan" required error={errors.district}>
          <input
            id="district"
            className="field-input"
            value={data.district}
            onChange={(e) => onChange('district', e.target.value)}
          />
        </PpdbField>
      </div>

      <PpdbField id="village" label="Kelurahan/Desa" required error={errors.village}>
        <input id="village" className="field-input" value={data.village} onChange={(e) => onChange('village', e.target.value)} />
      </PpdbField>
    </div>
  )
}
