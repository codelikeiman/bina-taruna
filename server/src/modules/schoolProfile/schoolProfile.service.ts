import { pool } from '../../db/pool'
import { notFound } from '../../utils/httpError'

export interface SchoolProfileInput {
  name: string
  short_name: string
  full_legal_name: string
  tagline: string
  motto: string
  founded_year: number
  accreditation: string
  npsn: string
  email: string
  phone: string
  whatsapp: string
  address_street: string
  address_area: string
  address_city: string
  instagram: string
  youtube: string
  facebook: string
}

export async function getSchoolProfile() {
  const { rows } = await pool.query('SELECT * FROM school_profile WHERE id = 1 LIMIT 1')
  if (!rows[0]) {
    throw notFound('Profil sekolah belum dikonfigurasi. Jalankan "npm run db:migrate" di folder server.')
  }
  return rows[0]
}

export async function updateSchoolProfile(input: SchoolProfileInput) {
  await pool.query(
    `UPDATE school_profile SET
       name = $1, short_name = $2, full_legal_name = $3, tagline = $4, motto = $5,
       founded_year = $6, accreditation = $7, npsn = $8, email = $9, phone = $10, whatsapp = $11,
       address_street = $12, address_area = $13, address_city = $14,
       instagram = $15, youtube = $16, facebook = $17
     WHERE id = 1`,
    [
      input.name, input.short_name, input.full_legal_name, input.tagline, input.motto,
      input.founded_year, input.accreditation, input.npsn, input.email, input.phone, input.whatsapp,
      input.address_street, input.address_area, input.address_city,
      input.instagram, input.youtube, input.facebook,
    ],
  )
  return getSchoolProfile()
}
