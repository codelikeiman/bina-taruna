import type { QueryResultRow } from 'pg'
import { pool } from '../db/pool'
import type { FieldDef, ResourceConfig } from '../types/resource'

/**
 * Repository generik: setiap resource di src/resources/registry.ts didukung
 * oleh kelas ini, jadi menambah satu bagian konten baru tidak perlu SQL baru.
 * Nama kolom & tabel SELALU berasal dari ResourceConfig yang sudah kita
 * definisikan sendiri (bukan dari input pengguna), jadi identifier di SQL
 * di bawah aman meski disusun lewat template string.
 */
export class CrudRepository {
  constructor(private readonly resource: ResourceConfig) {}

  private get columns(): string[] {
    return this.resource.fields.map((f) => f.name)
  }

  private serializeValue(field: FieldDef, value: unknown): unknown {
    if (field.type === 'string-list') return JSON.stringify(value)
    // Kolom photo_url bertipe NULL di database — simpan sebagai NULL saat
    // kosong (bukan string kosong) supaya konsisten dengan "belum ada foto".
    if (field.type === 'image' && value === '') return null
    return value
  }

  private deserializeRow(row: QueryResultRow): Record<string, unknown> {
    const out: Record<string, unknown> = { id: row.id, sort_order: row.sort_order }
    for (const field of this.resource.fields) {
      const raw = row[field.name]
      if (field.type === 'string-list') {
        // pg sudah mem-parse kolom JSONB menjadi array/objek JS secara
        // otomatis, tapi kita jaga-jaga bila suatu saat kembali sebagai string.
        out[field.name] = typeof raw === 'string' ? JSON.parse(raw) : raw
      } else if (field.type === 'image') {
        out[field.name] = raw ?? ''
      } else {
        out[field.name] = raw
      }
    }
    return out
  }

  async list() {
    const { rows } = await pool.query(
      `SELECT * FROM "${this.resource.table}" ORDER BY sort_order ASC, id ASC`,
    )
    return rows.map((r) => this.deserializeRow(r))
  }

  async findById(id: number) {
    const { rows } = await pool.query(
      `SELECT * FROM "${this.resource.table}" WHERE id = $1 LIMIT 1`,
      [id],
    )
    return rows[0] ? this.deserializeRow(rows[0]) : null
  }

  async create(data: Record<string, unknown>) {
    const cols = this.columns
    const values = this.resource.fields.map((f) => this.serializeValue(f, data[f.name]))

    const { rows: orderRows } = await pool.query<{ next_order: number }>(
      `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM "${this.resource.table}"`,
    )
    const nextOrder = orderRows[0].next_order

    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ')
    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO "${this.resource.table}" (${cols.map((c) => `"${c}"`).join(', ')}, sort_order)
       VALUES (${placeholders}, $${cols.length + 1})
       RETURNING id`,
      [...values, nextOrder],
    )

    return this.findById(rows[0].id)
  }

  async update(id: number, data: Record<string, unknown>) {
    const cols = this.columns
    const values = this.resource.fields.map((f) => this.serializeValue(f, data[f.name]))
    const setClause = cols.map((c, i) => `"${c}" = $${i + 1}`).join(', ')

    const result = await pool.query(
      `UPDATE "${this.resource.table}" SET ${setClause} WHERE id = $${cols.length + 1}`,
      [...values, id],
    )
    if ((result.rowCount ?? 0) === 0) return null
    return this.findById(id)
  }

  async remove(id: number): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM "${this.resource.table}" WHERE id = $1`,
      [id],
    )
    return (result.rowCount ?? 0) > 0
  }

  /**
   * Menetapkan ulang sort_order (1..N) sesuai urutan id yang dikirim admin
   * (mis. setelah drag-and-drop / tombol naik-turun di dashboard).
   * Dijalankan dalam satu transaksi supaya tidak ada urutan "setengah jadi"
   * yang terlihat pengunjung situs bila permintaan gagal di tengah jalan.
   */
  async reorder(orderedIds: number[]): Promise<void> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      for (let i = 0; i < orderedIds.length; i++) {
        await client.query(
          `UPDATE "${this.resource.table}" SET sort_order = $1 WHERE id = $2`,
          [i + 1, orderedIds[i]],
        )
      }
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
}
