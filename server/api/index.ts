import { createApp } from '../src/app'

/**
 * Entry point khusus Vercel. Vercel mendeteksi tiap file di api/ sebagai
 * satu serverless function — export default (req, res) => {} adalah
 * kontraknya, dan Express app itu sendiri sudah punya signature yang
 * kompatibel, jadi cukup diekspor langsung tanpa app.listen().
 *
 * vercel.json di root project ini mengarahkan SEMUA path ("/(.*)")  ke
 * function ini, supaya routing /api/*, /api/admin/*, dsb tetap ditangani
 * oleh Express router di app.ts seperti biasa — Vercel hanya jadi
 * "pembungkus" luar, bukan pengganti Express routing.
 *
 * Pool koneksi Postgres (src/db/pool.ts) dibuat sekali di scope modul dan
 * dipakai ulang selama instance function masih "warm" antar-request —
 * PENTING: DATABASE_URL di Vercel harus pakai Supabase Transaction pooler
 * (port 6543) dengan DB_POOL_MAX=1, karena tiap instance serverless bisa
 * berjalan paralel dan gampang menghabiskan connection limit Postgres bila
 * masing-masing membuka pool besar. Lihat catatan di src/db/pool.ts.
 */
export default createApp()
