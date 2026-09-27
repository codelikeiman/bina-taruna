import { pool } from '../../db/pool'
import type { PpdbSettings } from './ppdb.types'

interface SettingsRow {
  academic_year: string
  is_open: number
  closed_message: string | null
}

function mapRow(row: SettingsRow): PpdbSettings {
  return {
    academicYear: row.academic_year,
    isOpen: row.is_open === 1,
    closedMessage: row.closed_message ?? '',
  }
}

/**
 * Baris pengaturan PPDB memakai pola singleton yang sama dengan
 * school_profile/vision_mission (id tetap 1, lihat schema.sql). Bila belum
 * pernah diisi (instalasi baru sebelum admin membuka halaman "Pengaturan
 * PPDB"), kembalikan default aman: pendaftaran TERTUTUP.
 */
export async function getPpdbSettings(): Promise<PpdbSettings> {
  const { rows } = await pool.query<SettingsRow>(
    'SELECT academic_year, is_open, closed_message FROM ppdb_settings WHERE id = 1 LIMIT 1',
  )
  if (rows.length === 0) {
    const nextYear = new Date().getFullYear() + 1
    return { academicYear: `${nextYear}/${nextYear + 1}`, isOpen: false, closedMessage: '' }
  }
  return mapRow(rows[0])
}

export async function updatePpdbSettings(input: PpdbSettings): Promise<PpdbSettings> {
  await pool.query(
    `INSERT INTO ppdb_settings (id, academic_year, is_open, closed_message)
     VALUES (1, $1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET
       academic_year = EXCLUDED.academic_year, is_open = EXCLUDED.is_open, closed_message = EXCLUDED.closed_message`,
    [input.academicYear, input.isOpen ? 1 : 0, input.closedMessage || null],
  )
  return getPpdbSettings()
}
