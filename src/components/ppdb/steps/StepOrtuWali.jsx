import PpdbField from '../PpdbField'

export default function StepOrtuWali({ data, errors, onChange }) {
  return (
    <div className="space-y-7">
      <div>
        <h3 className="font-display text-lg text-navy-900 mb-4">Data Ayah</h3>
        <div className="space-y-5">
          <PpdbField id="fatherName" label="Nama Lengkap Ayah" required error={errors.fatherName}>
            <input
              id="fatherName"
              className="field-input"
              value={data.fatherName}
              onChange={(e) => onChange('fatherName', e.target.value)}
            />
          </PpdbField>
          <div className="grid gap-5 sm:grid-cols-2">
            <PpdbField id="fatherJob" label="Pekerjaan Ayah" required error={errors.fatherJob}>
              <input
                id="fatherJob"
                className="field-input"
                value={data.fatherJob}
                onChange={(e) => onChange('fatherJob', e.target.value)}
              />
            </PpdbField>
            <PpdbField id="fatherPhone" label="Nomor HP/WhatsApp Ayah" required error={errors.fatherPhone}>
              <input
                id="fatherPhone"
                type="tel"
                className="field-input"
                placeholder="08xxxxxxxxxx"
                value={data.fatherPhone}
                onChange={(e) => onChange('fatherPhone', e.target.value.replace(/[^\d+]/g, ''))}
              />
            </PpdbField>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-navy-900 mb-4">Data Ibu</h3>
        <div className="space-y-5">
          <PpdbField id="motherName" label="Nama Lengkap Ibu" required error={errors.motherName}>
            <input
              id="motherName"
              className="field-input"
              value={data.motherName}
              onChange={(e) => onChange('motherName', e.target.value)}
            />
          </PpdbField>
          <div className="grid gap-5 sm:grid-cols-2">
            <PpdbField id="motherJob" label="Pekerjaan Ibu" required error={errors.motherJob}>
              <input
                id="motherJob"
                className="field-input"
                value={data.motherJob}
                onChange={(e) => onChange('motherJob', e.target.value)}
              />
            </PpdbField>
            <PpdbField id="motherPhone" label="Nomor HP/WhatsApp Ibu" required error={errors.motherPhone}>
              <input
                id="motherPhone"
                type="tel"
                className="field-input"
                placeholder="08xxxxxxxxxx"
                value={data.motherPhone}
                onChange={(e) => onChange('motherPhone', e.target.value.replace(/[^\d+]/g, ''))}
              />
            </PpdbField>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-100 pt-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-navy-300 text-gold-500 focus-visible:outline-2 focus-visible:outline-gold-500"
            checked={data.hasGuardian}
            onChange={(e) => onChange('hasGuardian', e.target.checked)}
          />
          <span className="text-sm text-navy-700">
            Calon siswa saat ini tinggal bersama wali, bukan bersama orang tua kandung
          </span>
        </label>

        {data.hasGuardian && (
          <div className="mt-5 space-y-5 rounded-xl bg-navy-50/60 p-5">
            <PpdbField id="guardianName" label="Nama Lengkap Wali" required error={errors.guardianName}>
              <input
                id="guardianName"
                className="field-input"
                value={data.guardianName}
                onChange={(e) => onChange('guardianName', e.target.value)}
              />
            </PpdbField>
            <PpdbField id="guardianRelationship" label="Hubungan dengan Siswa" required error={errors.guardianRelationship}>
              <input
                id="guardianRelationship"
                className="field-input"
                placeholder="Mis. Paman, Kakek, Kakak"
                value={data.guardianRelationship}
                onChange={(e) => onChange('guardianRelationship', e.target.value)}
              />
            </PpdbField>
            <div className="grid gap-5 sm:grid-cols-2">
              <PpdbField id="guardianJob" label="Pekerjaan Wali" required error={errors.guardianJob}>
                <input
                  id="guardianJob"
                  className="field-input"
                  value={data.guardianJob}
                  onChange={(e) => onChange('guardianJob', e.target.value)}
                />
              </PpdbField>
              <PpdbField id="guardianPhone" label="Nomor HP/WhatsApp Wali" required error={errors.guardianPhone}>
                <input
                  id="guardianPhone"
                  type="tel"
                  className="field-input"
                  placeholder="08xxxxxxxxxx"
                  value={data.guardianPhone}
                  onChange={(e) => onChange('guardianPhone', e.target.value.replace(/[^\d+]/g, ''))}
                />
              </PpdbField>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
