import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

/**
 * Client Supabase sisi server, pakai service_role key (bukan anon key) —
 * bisa baca/tulis bucket privat (ppdb-documents) tanpa terikat RLS policy
 * per-user, karena akses dokumen PPDB sepenuhnya dikontrol lewat
 * requireAdmin di ppdb.admin.router.ts, bukan lewat RLS Supabase.
 *
 * JANGAN PERNAH import file ini dari kode yang bisa berakhir di bundle
 * frontend (root/admin) — service_role key setara akses admin penuh ke
 * seluruh project Supabase.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})
