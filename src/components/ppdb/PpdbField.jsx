/**
 * Pembungkus generik untuk satu field formulir PPDB — dipakai di semua step
 * karena jumlah field terlalu banyak (~30) untuk menulis label+error+hint
 * manual di tiap tempat seperti Contact.jsx (yang cuma 3 field). Input
 * sesungguhnya (text/select/textarea) dikirim sebagai children supaya
 * komponen ini tetap fleksibel untuk semua jenis input.
 */
export default function PpdbField({ id, label, required, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="text-maroon-500"> *</span>}
      </label>
      {children}
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
