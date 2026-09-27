/**
 * Bentuk ini sengaja dibuat sepadan dengan `ResourceConfig` di
 * server/src/types/resource.ts. Dashboard TIDAK menerima metadata field
 * dari API (endpoint semacam itu belum ada di backend), jadi setiap
 * resource didefinisikan ulang secara statis di
 * src/lib/resourceDefinitions.ts — namun bentuknya sama persis supaya
 * mudah dicocokkan bila suatu saat backend menyediakan metadata otomatis.
 */
export type FieldType = 'string' | 'text' | 'number' | 'icon' | 'string-list' | 'image'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  required?: boolean
  maxLength?: number
  min?: number
  max?: number
  /** Petunjuk singkat di bawah field, mis. contoh format. */
  hint?: string
  /** Placeholder input. */
  placeholder?: string
}

export interface ResourceDef {
  key: string
  label: string
  labelSingular: string
  fields: FieldDef[]
  /** Nama field yang dipakai sebagai judul kartu/baris di daftar. */
  titleField: string
  /** Nama field kedua (opsional) ditampilkan sebagai sub-judul. */
  subtitleField?: string
}

/** Baris data generik: id + sort_order + field lain sesuai ResourceDef. */
export type ResourceItem = {
  id: number
  sort_order: number
  [key: string]: unknown
}
