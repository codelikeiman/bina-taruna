import { Router } from 'express'
import { pool } from '../../db/pool'
import { asyncHandler } from '../../middleware/asyncHandler'
import { CrudRepository } from '../../crud/crudRepository'
import { resources } from '../../resources/registry'
import { getSchoolProfile } from '../schoolProfile/schoolProfile.service'

export const publicSiteRouter = Router()

const repoByKey = new Map(resources.map((r) => [r.key, new CrudRepository(r)]))

async function getVision(): Promise<string> {
  const { rows } = await pool.query('SELECT vision FROM vision_mission WHERE id = 1 LIMIT 1')
  return (rows[0]?.vision as string) ?? ''
}

/**
 * GET /api/site-content
 *
 * Satu panggilan yang mengembalikan seluruh konten publik sekaligus, dengan
 * bentuk (shape) yang sama persis dengan ekspor di src/data/schoolData.js
 * milik proyek asli. Ini supaya frontend cukup mengganti "import { X } from
 * '../data/schoolData'" menjadi "const { X } = useSiteContent()" tanpa perlu
 * menulis ulang JSX di setiap komponen — lihat client/src/hooks/useSiteContent.js.
 *
 * Untuk resource yang tidak perlu tampil di company profile publik (saat ini
 * tidak ada), cukup jangan disertakan di sini — endpoint /api/admin/:resource
 * tetap tersedia untuk dashboard.
 */
publicSiteRouter.get(
  '/site-content',
  asyncHandler(async (_req, res) => {
    const [profile, vision, ...lists] = await Promise.all([
      getSchoolProfile(),
      getVision(),
      repoByKey.get('stats')!.list(),
      repoByKey.get('history-paragraphs')!.list(),
      repoByKey.get('milestones')!.list(),
      repoByKey.get('missions')!.list(),
      repoByKey.get('facilities')!.list(),
      repoByKey.get('extracurriculars')!.list(),
      repoByKey.get('achievements')!.list(),
      repoByKey.get('leadership')!.list(),
      repoByKey.get('teachers')!.list(),
      repoByKey.get('org-tiers')!.list(),
      repoByKey.get('gallery')!.list(),
      repoByKey.get('testimonials')!.list(),
    ])

    const [
      stats, historyParagraphs, milestones, missions, facilities,
      extracurriculars, achievements, leadership, teachers, orgTiers, gallery, testimonials,
    ] = lists

    res.json({
      schoolProfile: {
        name: profile.name,
        shortName: profile.short_name,
        fullLegalName: profile.full_legal_name,
        tagline: profile.tagline,
        motto: profile.motto,
        founded: profile.founded_year,
        accreditation: profile.accreditation,
        npsn: profile.npsn,
        email: profile.email,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        address: {
          street: profile.address_street,
          area: profile.address_area,
          city: profile.address_city,
        },
        socials: {
          instagram: profile.instagram,
          youtube: profile.youtube,
          facebook: profile.facebook,
        },
      },
      stats: stats.map((s) => ({ icon: s.icon, label: s.label, value: s.value, suffix: s.suffix })),
      history: {
        paragraphs: historyParagraphs.map((p) => p.content),
        milestones: milestones.map((m) => ({ year: m.year, title: m.title, description: m.description })),
      },
      visionMission: {
        vision,
        missions: missions.map((m) => m.content),
      },
      facilities: facilities.map((f) => ({ icon: f.icon, title: f.title, description: f.description })),
      extracurriculars: extracurriculars.map((e) => ({
        icon: e.icon,
        name: e.name,
        description: e.description || null,
        imageUrl: e.image_url || null,
      })),
      achievements: achievements.map((a) => ({
        name: a.student_name,
        grade: a.grade,
        title: a.title,
        level: a.level,
        icon: a.icon,
        photoUrl: a.photo_url || null,
      })),
      leadership: leadership.map((l) => ({ name: l.name, role: l.role, photoUrl: l.photo_url || null })),
      teachers: teachers.map((t) => ({ name: t.name, subject: t.subject, photoUrl: t.photo_url || null })),
      orgStructure: { tiers: orgTiers.map((t) => ({ level: t.level, names: t.names })) },
      gallery: gallery.map((g) => ({ title: g.title, icon: g.icon, photoUrl: g.photo_url || null })),
      testimonials: testimonials.map((t) => ({ name: t.name, role: t.role, quote: t.quote })),
    })
  }),
)
