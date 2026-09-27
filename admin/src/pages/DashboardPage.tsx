import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList, Mail, UserCog } from 'lucide-react'
import { resourceApi, contactApi, ApiError } from '../lib/api'
import { ppdbRegistrationsApi } from '../lib/ppdbApi'
import { usersAdminApi } from '../lib/usersApi'
import { resourceDefinitions } from '../lib/resourceDefinitions'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { admin } = useAuth()
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [unreadCount, setUnreadCount] = useState<number | null>(null)
  const [pendingPpdbCount, setPendingPpdbCount] = useState<number | null>(null)
  const [pendingUserCount, setPendingUserCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all(
      resourceDefinitions.map(async (r) => {
        try {
          const { items } = await resourceApi.list(r.key)
          return [r.key, items.length] as const
        } catch {
          return [r.key, 0] as const
        }
      }),
    ).then((entries) => {
      if (!cancelled) setCounts(Object.fromEntries(entries))
    })

    contactApi
      .list()
      .then(({ items }) => {
        if (!cancelled) setUnreadCount(items.filter((m) => !m.is_read).length)
      })
      .catch((err) => {
        if (!cancelled && err instanceof ApiError) setUnreadCount(0)
      })

    // pageSize kecil karena hanya butuh `total` dari hasil COUNT(*) backend,
    // bukan daftar itemnya — lihat listRegistrations di ppdb.registrations.service.ts.
    ppdbRegistrationsApi
      .list({ status: 'diajukan', pageSize: 1 })
      .then(({ total }) => {
        if (!cancelled) setPendingPpdbCount(total)
      })
      .catch(() => {
        if (!cancelled) setPendingPpdbCount(0)
      })

    usersAdminApi
      .list('pending_admin_approval')
      .then(({ items }) => {
        if (!cancelled) setPendingUserCount(items.length)
      })
      .catch(() => {
        if (!cancelled) setPendingUserCount(0)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">
        Selamat datang, {admin?.name?.split(' ')[0] ?? 'Admin'}
      </h1>
      <p className="mt-1.5 text-sm text-navy-500">
        Kelola seluruh isi situs company profile SMA Bina Taruna dari sini. Perubahan yang disimpan langsung tampil di situs publik.
      </p>

      {pendingPpdbCount !== null && pendingPpdbCount > 0 && (
        <Link
          to="/ppdb-registrations?status=diajukan"
          className="mt-6 flex items-center gap-3 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3.5 text-sm text-navy-800 hover:bg-gold-100 transition-colors"
        >
          <ClipboardList size={18} className="text-gold-600 shrink-0" />
          <span className="flex-1">
            Ada <strong>{pendingPpdbCount}</strong> pendaftar PPDB baru yang menunggu verifikasi.
          </span>
          <ArrowRight size={16} className="shrink-0" />
        </Link>
      )}

      {pendingUserCount !== null && pendingUserCount > 0 && (
        <Link
          to="/ppdb-user-accounts"
          className="mt-3 flex items-center gap-3 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3.5 text-sm text-navy-800 hover:bg-gold-100 transition-colors"
        >
          <UserCog size={18} className="text-gold-600 shrink-0" />
          <span className="flex-1">
            Ada <strong>{pendingUserCount}</strong> akun pengguna baru yang menunggu persetujuan.
          </span>
          <ArrowRight size={16} className="shrink-0" />
        </Link>
      )}

      {unreadCount !== null && unreadCount > 0 && (
        <Link
          to="/contact-messages"
          className="mt-3 flex items-center gap-3 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3.5 text-sm text-navy-800 hover:bg-gold-100 transition-colors"
        >
          <Mail size={18} className="text-gold-600 shrink-0" />
          <span className="flex-1">
            Ada <strong>{unreadCount}</strong> pesan kontak baru yang belum dibaca.
          </span>
          <ArrowRight size={16} className="shrink-0" />
        </Link>
      )}

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {resourceDefinitions.map((r) => (
          <Link
            key={r.key}
            to={`/${r.key}`}
            className="card p-4 hover:border-navy-300 transition-colors"
          >
            <p className="text-2xl font-display font-semibold text-navy-900">{counts[r.key] ?? '—'}</p>
            <p className="mt-0.5 text-xs text-navy-500">{r.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 card p-5">
        <h2 className="text-sm font-semibold text-navy-800 mb-1">Belum tahu mulai dari mana?</h2>
        <p className="text-sm text-navy-500 leading-relaxed">
          Bagian <strong>Profil &amp; Kontak</strong> dan <strong>Visi &amp; Misi</strong> di menu "Identitas Sekolah"
          biasanya paling jarang berubah — cocok dipastikan benar terlebih dulu. Untuk menambah data baru sehari-hari
          (prestasi, guru, ekskul, dsb.), buka bagian yang sesuai di menu "Konten Situs" lalu klik tombol{' '}
          <strong>Tambah</strong>.
        </p>
      </div>
    </div>
  )
}
