import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, getStoredToken, setStoredToken, type AdminIdentity } from '../lib/api'

interface AuthContextValue {
  admin: AdminIdentity | null
  /** true selama pemeriksaan sesi awal berjalan (token di localStorage divalidasi ke /auth/me). */
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Provider dan hook useAuth() sengaja disatukan di file ini (pola Context
// standar) meski itu berarti mengedit salah satunya memicu reload penuh,
// bukan fast refresh — memisah hook dua baris ke file sendiri demi fast
// refresh bukan trade-off yang sepadan di sini.
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminIdentity | null>(null)
  // Inisialisasi malas (lazy initializer): getStoredToken() membaca
  // localStorage, jadi hanya dijalankan sekali saat mount, bukan tiap
  // render. Bila tidak ada token tersimpan, tidak ada apa pun yang perlu
  // divalidasi ke server — isLoading langsung false sejak render pertama,
  // tanpa perlu efek untuk kasus ini.
  const [isLoading, setIsLoading] = useState(() => getStoredToken() !== null)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) return

    // Token tersimpan bisa saja sudah kedaluwarsa — validasi ke server
    // sebelum menganggap pengguna masih login, supaya tidak muncul
    // dashboard kosong yang lalu langsung menolak setiap permintaan.
    authApi
      .me()
      .then(({ admin }) => setAdmin(admin))
      .catch(() => setStoredToken(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { token, admin } = await authApi.login(email, password)
    setStoredToken(token)
    setAdmin(admin)
  }, [])

  const logout = useCallback(() => {
    setStoredToken(null)
    setAdmin(null)
  }, [])

  return <AuthContext.Provider value={{ admin, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>.')
  return ctx
}
