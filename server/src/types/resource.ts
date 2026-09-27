/**
 * Deskripsi satu kolom yang bisa diedit lewat CRUD generik.
 * `id`, `sort_order`, dan timestamp SELALU dikelola otomatis oleh
 * crudRepository — jangan didaftarkan di sini.
 */
export type FieldType = 'string' | 'text' | 'number' | 'icon' | 'string-list' | 'image'

export interface FieldDef {
  /** Nama kolom di database (snake_case, sama persis dengan MySQL). */
  name: string
  type: FieldType
  required?: boolean
  /** Hanya untuk type 'string'/'text'. */
  maxLength?: number
  /** Hanya untuk type 'number'. */
  min?: number
  max?: number
}

export interface ResourceConfig {
  /** Kunci di URL, mis. "achievements" -> /api/admin/achievements */
  key: string
  /** Nama tabel MySQL. */
  table: string
  /** Label berbahasa Indonesia untuk pesan error & log. */
  label: string
  fields: FieldDef[]
}
