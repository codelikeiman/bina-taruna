import { z } from 'zod'
import { REGISTRATION_STATUSES, RELIGION_OPTIONS } from './ppdb.types'

const trimmed = (max: number) => z.string().trim().min(1, 'Wajib diisi.').max(max, `Maksimal ${max} karakter.`)

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+62|62|0)8\d{8,12}$/, 'Nomor HP/WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx atau +62xxxxxxxxxxx.')

const nikSchema = z.string().trim().regex(/^\d{16}$/, 'NIK harus terdiri dari tepat 16 digit angka.')
const nisnSchema = z.string().trim().regex(/^\d{10}$/, 'NISN harus terdiri dari tepat 10 digit angka.')

/**
 * Field opsional dari HTML <select>/query string sering datang sebagai
 * STRING KOSONG, bukan benar-benar tidak ada (mis. <select> tanpa pilihan
 * dipilih, atau filter "Semua Status" di UI admin yang mengirim `?status=`).
 * Zod menganggap '' sebagai nilai valid yang tetap dicoba divalidasi, BUKAN
 * setara "tidak diisi" — dan `z.coerce.number()` pada '' menghasilkan 0
 * (bukan error), yang baru gagal belakangan di .positive() dengan pesan
 * membingungkan ("must be greater than 0"). Helper ini menyamakan '' dengan
 * undefined SEBELUM masuk ke validasi sesungguhnya, dipakai untuk tiap field
 * angka/enum yang .optional().
 */
const emptyToUndefined = (val: unknown) => (val === '' ? undefined : val)
const optionalPositiveInt = () => z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional())

const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal lahir tidak valid.')
  .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Tanggal lahir tidak valid.')
  .refine((value) => {
    const year = Number(value.slice(0, 4))
    const currentYear = new Date().getFullYear()
    // Rentang usia longgar (bukan validasi usia SMA yang ketat) — sekadar
    // menangkap salah ketik tahun yang jelas-jelas tidak masuk akal.
    return year >= currentYear - 30 && year <= currentYear - 8
  }, 'Tanggal lahir tampak tidak wajar untuk pendaftaran SMA. Periksa kembali.')

/**
 * Body request POST /api/ppdb-registrations. Dikirim sebagai multipart/form-data
 * (karena disertai berkas), jadi setiap nilai tiba sebagai string — termasuk
 * yang secara semantik boolean/angka. Koersi dilakukan eksplisit di sini,
 * bukan mengandalkan z.coerce agar pesan error tetap presisi per-field.
 *
 * `website` adalah honeypot: field tersembunyi di form yang hanya diisi bot.
 * Bila terisi, permintaan otomatis gagal di validasi (pesan generik, tidak
 * membocorkan bahwa ini mekanisme anti-bot) tanpa perlu CAPTCHA pihak ketiga.
 */
export const registrationSubmitSchema = z
  .object({
    // Data calon siswa
    nik: nikSchema,
    nisn: nisnSchema,
    fullName: trimmed(150),
    birthPlace: trimmed(150),
    birthDate: birthDateSchema,
    gender: z.enum(['L', 'P'], { errorMap: () => ({ message: 'Pilih jenis kelamin.' }) }),
    religion: z.enum(RELIGION_OPTIONS, { errorMap: () => ({ message: 'Pilih agama.' }) }),
    phone: phoneSchema,
    email: z.string().trim().email('Alamat email tidak valid.').max(190),

    // Data alamat
    address: trimmed(400),
    province: trimmed(100),
    city: trimmed(150),
    district: trimmed(150),
    village: trimmed(150),

    // Data ayah
    fatherName: trimmed(150),
    fatherJob: trimmed(150),
    fatherPhone: phoneSchema,

    // Data ibu
    motherName: trimmed(150),
    motherJob: trimmed(150),
    motherPhone: phoneSchema,

    // Data wali — opsional, hanya wajib bila hasGuardian = true
    hasGuardian: z.enum(['true', 'false']).transform((v) => v === 'true'),
    guardianName: z.string().trim().max(150).optional().default(''),
    guardianRelationship: z.string().trim().max(100).optional().default(''),
    guardianJob: z.string().trim().max(150).optional().default(''),
    guardianPhone: z.string().trim().max(30).optional().default(''),

    // Pilihan pendaftaran
    majorId: optionalPositiveInt(),
    previousSchool: trimmed(200),

    // Pernyataan — harus persis 'true' (checkbox tercentang)
    agreementAccepted: z.literal('true', {
      errorMap: () => ({ message: 'Anda harus menyetujui pernyataan kebenaran data sebelum mengirim.' }),
    }),

    // Honeypot anti-bot — HARUS kosong. Lihat komentar di atas.
    website: z.literal('').optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.hasGuardian) {
      if (!data.guardianName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianName'], message: 'Nama wali wajib diisi.' })
      }
      if (!data.guardianRelationship) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardianRelationship'],
          message: 'Hubungan dengan siswa wajib diisi.',
        })
      }
      if (!data.guardianJob) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianJob'], message: 'Pekerjaan wali wajib diisi.' })
      }
      if (!data.guardianPhone) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['guardianPhone'], message: 'Nomor HP/WhatsApp wali wajib diisi.' })
      } else if (!/^(\+62|62|0)8\d{8,12}$/.test(data.guardianPhone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['guardianPhone'],
          message: 'Nomor HP/WhatsApp wali tidak valid.',
        })
      }
    }
  })

export type RegistrationSubmitInput = z.infer<typeof registrationSubmitSchema>

export const statusCheckSchema = z.object({
  registrationNumber: z.string().trim().min(1, 'Nomor pendaftaran wajib diisi.').max(40),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal lahir wajib diisi.'),
})

export const statusUpdateSchema = z
  .object({
    status: z.enum(REGISTRATION_STATUSES),
    note: z.string().trim().max(1000).optional().default(''),
  })
  .superRefine((data, ctx) => {
    if ((data.status === 'perlu_revisi' || data.status === 'ditolak') && !data.note) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['note'],
        message: 'Catatan wajib diisi untuk status ini, supaya calon siswa/admin lain tahu alasannya.',
      })
    }
  })

export const settingsUpdateSchema = z.object({
  academicYear: z
    .string()
    .trim()
    .regex(/^\d{4}\/\d{4}$/, 'Format tahun ajaran: YYYY/YYYY, mis. 2027/2028.')
    .refine((v) => {
      const [a, b] = v.split('/').map(Number)
      return b === a + 1
    }, 'Tahun ajaran harus dua tahun berurutan, mis. 2027/2028.'),
  isOpen: z.boolean(),
  closedMessage: z.string().trim().max(500).optional().default(''),
})

export const listQuerySchema = z.object({
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(1)),
  pageSize: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().max(100).default(20)),
  status: z.preprocess(emptyToUndefined, z.enum(REGISTRATION_STATUSES).optional()),
  majorId: optionalPositiveInt(),
  search: z.string().trim().max(100).optional(),
})
