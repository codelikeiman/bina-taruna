import type { FieldDef, ResourceDef } from '../types/resource'

export type FormValues = Record<string, string | number | string[]>

/**
 * Validasi ringan di sisi klien, mencerminkan aturan Zod yang sama di
 * server/src/crud/schemaBuilder.ts. Ini HANYA untuk umpan balik instan
 * di formulir (menyorot field sebelum submit) — backend tetap menjadi
 * sumber kebenaran akhir, dan pesan errornya (termasuk dari `fields`
 * pada respons 400) selalu ditampilkan juga bila validasi klien lolos
 * tapi ternyata backend menolak.
 */
export function validateResourceForm(resource: ResourceDef, values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const field of resource.fields) {
    const raw = values[field.name]
    const message = validateField(field, raw)
    if (message) errors[field.name] = message
  }

  return errors
}

function validateField(field: FieldDef, raw: FormValues[string]): string | null {
  switch (field.type) {
    case 'string':
    case 'text':
    case 'icon': {
      const str = typeof raw === 'string' ? raw.trim() : ''
      if (field.required && str.length === 0) return 'Wajib diisi.'
      if (field.maxLength && str.length > field.maxLength) return `Maksimal ${field.maxLength} karakter.`
      return null
    }
    case 'image': {
      // Nilainya adalah path hasil unggahan (atau kosong) — validasi format
      // berkas sudah ditangani saat unggah (lihat ImageUploadField), field
      // ini sendiri hanya wajib diisi bila secara eksplisit ditandai required.
      const str = typeof raw === 'string' ? raw.trim() : ''
      if (field.required && str.length === 0) return 'Foto wajib diunggah.'
      return null
    }
    case 'number': {
      const num = typeof raw === 'number' ? raw : Number(raw)
      if (raw === '' || raw === undefined || Number.isNaN(num)) return 'Wajib diisi angka.'
      if (field.min !== undefined && num < field.min) return `Minimal ${field.min}.`
      if (field.max !== undefined && num > field.max) return `Maksimal ${field.max}.`
      return null
    }
    case 'string-list': {
      const arr = Array.isArray(raw) ? raw : []
      if (field.required && arr.length === 0) return 'Minimal satu nilai.'
      if (arr.length > 20) return 'Maksimal 20 nilai.'
      return null
    }
  }
}

/** Nilai form awal untuk field baru (create) — string kosong / array kosong per tipe. */
export function emptyFormValues(resource: ResourceDef): FormValues {
  const values: FormValues = {}
  for (const field of resource.fields) {
    values[field.name] = field.type === 'string-list' ? [] : field.type === 'number' ? '' : ''
  }
  return values
}

/** Mengubah item hasil API menjadi nilai form untuk mode edit. */
export function itemToFormValues(resource: ResourceDef, item: Record<string, unknown>): FormValues {
  const values: FormValues = {}
  for (const field of resource.fields) {
    const raw = item[field.name]
    if (field.type === 'string-list') {
      values[field.name] = Array.isArray(raw) ? (raw as string[]) : []
    } else if (field.type === 'number') {
      values[field.name] = typeof raw === 'number' ? raw : Number(raw ?? 0)
    } else {
      values[field.name] = typeof raw === 'string' ? raw : String(raw ?? '')
    }
  }
  return values
}

/** Menyiapkan payload untuk dikirim ke API (angka dikonversi dari string input). */
export function formValuesToPayload(resource: ResourceDef, values: FormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  for (const field of resource.fields) {
    const raw = values[field.name]
    if (field.type === 'number') {
      payload[field.name] = typeof raw === 'number' ? raw : Number(raw)
    } else if (field.type === 'string-list') {
      payload[field.name] = Array.isArray(raw) ? raw : []
    } else {
      payload[field.name] = typeof raw === 'string' ? raw.trim() : raw
    }
  }
  return payload
}
