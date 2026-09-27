import { z, type ZodTypeAny } from 'zod'
import type { FieldDef, ResourceConfig } from '../types/resource'
import { isValidIconName } from '../resources/icons'

function schemaForField(field: FieldDef): ZodTypeAny {
  switch (field.type) {
    case 'string':
    case 'text': {
      let s = z.string().trim()
      if (field.maxLength) s = s.max(field.maxLength, `Maksimal ${field.maxLength} karakter.`)
      return field.required ? s.min(1, 'Wajib diisi.') : s.optional().default('')
    }
    case 'number': {
      let n = z.coerce.number()
      if (field.min !== undefined) n = n.min(field.min, `Minimal ${field.min}.`)
      if (field.max !== undefined) n = n.max(field.max, `Maksimal ${field.max}.`)
      return n
    }
    case 'icon':
      return z.string().refine(isValidIconName, {
        message: 'Nama ikon tidak dikenali. Pilih dari daftar ikon yang tersedia.',
      })
    case 'image':
      // Menyimpan PATH publik hasil unggahan (lihat modules/uploads), bukan
      // isi berkas itu sendiri. Opsional — kosong berarti item ini belum
      // punya foto dan tampilan publik jatuh kembali ke ikon.
      // Hanya menerima path relatif yang berasal dari endpoint unggahan kita
      // sendiri (diawali /uploads/), supaya field ini tidak bisa disalahgunakan
      // untuk menyisipkan URL eksternal sembarangan.
      return z
        .string()
        .trim()
        .max(255)
        .refine((v) => v === '' || v.startsWith('/uploads/'), {
          message: 'Foto tidak valid. Unggah ulang lewat tombol unggah foto.',
        })
        .optional()
        .default('')
    case 'string-list':
      return z
        .array(z.string().trim().min(1, 'Nilai tidak boleh kosong.').max(200))
        .min(1, 'Minimal satu nilai.')
        .max(20, 'Maksimal 20 nilai.')
  }
}

/** Skema untuk body permintaan create (POST) — semua field wajib sesuai konfigurasi. */
export function buildCreateSchema(resource: ResourceConfig) {
  const shape: Record<string, ZodTypeAny> = {}
  for (const field of resource.fields) {
    shape[field.name] = schemaForField(field)
  }
  return z.object(shape).strict()
}

/** Skema untuk body permintaan update (PUT) — sama, field tetap wajib agar data tidak setengah kosong. */
export function buildUpdateSchema(resource: ResourceConfig) {
  return buildCreateSchema(resource)
}

export const reorderSchema = z.object({
  /** Urutan id sesuai posisi baru yang diinginkan, dari atas ke bawah. */
  orderedIds: z.array(z.coerce.number().int().positive()).min(1),
})
