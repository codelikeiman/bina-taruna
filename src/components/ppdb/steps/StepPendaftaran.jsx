import PpdbField from '../PpdbField'

export default function StepPendaftaran({ data, errors, onChange, majors, academicYear }) {
  return (
    <div className="space-y-5">
      <PpdbField id="academicYear" label="Tahun Ajaran">
        <input id="academicYear" className="field-input bg-navy-50" value={academicYear} disabled readOnly />
      </PpdbField>

      {majors.length > 0 && (
        <PpdbField id="majorId" label="Jurusan/Peminatan" required error={errors.majorId}>
          <select
            id="majorId"
            className="field-input"
            value={data.majorId}
            onChange={(e) => onChange('majorId', e.target.value)}
          >
            <option value="">Pilih jurusan/peminatan</option>
            {majors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </PpdbField>
      )}

      <PpdbField
        id="previousSchool"
        label="Asal Sekolah (SMP/MTs)"
        required
        error={errors.previousSchool}
        hint="Nama sekolah asal secara lengkap"
      >
        <input
          id="previousSchool"
          className="field-input"
          placeholder="Mis. SMP Negeri 1 Jakarta"
          value={data.previousSchool}
          onChange={(e) => onChange('previousSchool', e.target.value)}
        />
      </PpdbField>
    </div>
  )
}
