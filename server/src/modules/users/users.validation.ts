import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(3, 'Nama minimal 3 karakter.').max(120),
  email: z.string().trim().toLowerCase().email('Format email tidak valid.'),
  password: z.string().min(8, 'Password minimal 8 karakter.'),
})
export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Format email tidak valid.'),
  password: z.string().min(1, 'Password wajib diisi.'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const verifyCodeSchema = z.object({
  email: z.string().trim().toLowerCase().email('Format email tidak valid.'),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Kode verifikasi harus terdiri dari 6 angka.'),
})
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>
