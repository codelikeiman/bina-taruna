import { useEffect, useState } from 'react'
import { fetchSiteContent, resolveMediaUrl } from '../lib/siteContentApi'
import { resolveIcon } from '../lib/resolveIcon'

/**
 * Menggantikan import statis dari ../data/schoolData dengan data yang
 * dimuat langsung dari database lewat dashboard admin. Bentuk hasilnya
 * disamakan persis dengan ekspor lama di schoolData.js — termasuk field
 * `icon` yang berupa KOMPONEN (bukan string nama ikon) — supaya setiap
 * komponen di src/components/ yang sudah menulis `<f.icon />` tetap
 * berfungsi tanpa perubahan lain.
 *
 * `stats[0].value` (tahun pengalaman) dihitung ulang di sisi klien dari
 * `schoolProfile.founded`, sama seperti perilaku schoolData.js yang
 * digantikannya — supaya admin tidak perlu mengingat untuk memperbarui
 * angka ini setiap pergantian tahun.
 */
export function useSiteContent() {
  const [state, setState] = useState({ data: null, isLoading: true, error: null })

  useEffect(() => {
    let cancelled = false

    fetchSiteContent()
      .then((raw) => {
        if (cancelled) return
        setState({ data: transform(raw), isLoading: false, error: null })
      })
      .catch((error) => {
        if (cancelled) return
        setState({ data: null, isLoading: false, error })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}

function transform(raw) {
  const currentYear = new Date().getFullYear()

  const stats = raw.stats.map((s) => {
    const isExperienceStat = s.label === 'Tahun Pengalaman'
    return {
      icon: resolveIcon(s.icon),
      label: s.label,
      value: isExperienceStat ? currentYear - raw.schoolProfile.founded : s.value,
      suffix: s.suffix ?? '',
    }
  })

  return {
    schoolProfile: raw.schoolProfile,
    stats,
    history: raw.history,
    visionMission: raw.visionMission,
    facilities: raw.facilities.map((f) => ({ ...f, icon: resolveIcon(f.icon) })),
    extracurriculars: raw.extracurriculars.map((e) => ({
      ...e,
      icon: resolveIcon(e.icon),
      // imageUrl bisa berupa URL absolut Supabase Storage atau (fallback)
      // path relatif terhadap origin API — resolveMediaUrl menangani
      // keduanya, supaya komponen Extracurricular tinggal memakai
      // <img src={e.imageUrl}>.
      imageUrl: resolveMediaUrl(e.imageUrl),
    })),
    achievements: raw.achievements.map((a) => ({
      ...a,
      icon: resolveIcon(a.icon),
      // photoUrl bisa berupa URL absolut Supabase Storage atau (fallback)
      // path relatif terhadap origin API — resolveMediaUrl menangani
      // keduanya, supaya komponen Achievements tinggal memakai
      // <img src={a.photoUrl}> apa adanya.
      photoUrl: resolveMediaUrl(a.photoUrl),
    })),
    leadership: raw.leadership.map((l) => ({
      ...l,
      photoUrl: resolveMediaUrl(l.photoUrl),
    })),
    teachers: raw.teachers.map((t) => ({
      ...t,
      photoUrl: resolveMediaUrl(t.photoUrl),
    })),
    orgStructure: raw.orgStructure,
    gallery: raw.gallery.map((g) => ({
      ...g,
      icon: resolveIcon(g.icon),
      photoUrl: resolveMediaUrl(g.photoUrl),
    })),
    testimonials: raw.testimonials,
  }
}
