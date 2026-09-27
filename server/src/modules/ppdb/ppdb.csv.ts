/**
 * Escaping sel CSV yang aman untuk dibuka di Excel/Sheets:
 *
 * 1. Kutip standar CSV: nilai yang mengandung koma, tanda kutip, atau baris
 *    baru dibungkus tanda kutip dua, dengan tanda kutip di dalamnya di-escape
 *    jadi dua tanda kutip berturutan.
 * 2. Mitigasi "CSV/formula injection": nilai yang DIAWALI karakter =, +, -,
 *    @, tab, atau CR akan ditafsirkan sebagai rumus oleh Excel/Sheets saat
 *    file dibuka (mis. isian nama "=cmd|'/c calc'!A1" bisa dieksekusi).
 *    Karena data di sini berasal dari isian publik (formulir pendaftar),
 *    setiap nilai semacam itu diberi awalan tanda kutip tunggal (') supaya
 *    dipaksa terbaca sebagai teks biasa. Ini rekomendasi standar OWASP.
 */
function escapeCsvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value)

  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`
  }

  if (/[",\n\r]/.test(text)) {
    text = `"${text.replace(/"/g, '""')}"`
  }

  return text
}

export function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(escapeCsvCell).join(',')]
  for (const row of rows) {
    lines.push(row.map(escapeCsvCell).join(','))
  }
  // BOM UTF-8 di awal supaya Excel mendeteksi encoding dengan benar
  // (tanpa ini, karakter non-ASCII pada nama/alamat bisa tampil rusak).
  return `\uFEFF${lines.join('\r\n')}`
}
