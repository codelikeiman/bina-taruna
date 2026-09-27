import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  getAuthToken,
  getStoredUser,
  loginUser as loginUserRequest,
  logoutUser as logoutUserRequest,
} from '../lib/usersApi'

const AuthContext = createContext(null)

let toastId = 0

/**
 * Provider tunggal untuk status login di seluruh halaman publik.
 * - Navbar, AuthPage, PpdbPage semua baca dari sini, jadi selalu sinkron.
 * - Ikut update kalau localStorage berubah dari tab lain (event 'storage')
 *   maupun dari tab yang sama (event custom 'auth-change' yang kita kirim
 *   sendiri setelah login/logout, karena 'storage' tidak nyala di tab asal).
 * - Nyediain toast singkat ("Berhasil masuk", dst.) tanpa nambah dependency.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [toasts, setToasts] = useState([])

  const pushToast = useCallback((message, tone = 'success') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const syncFromStorage = useCallback(() => {
    setUser(getStoredUser())
  }, [])

  useEffect(() => {
    window.addEventListener('storage', syncFromStorage)
    window.addEventListener('auth-change', syncFromStorage)
    return () => {
      window.removeEventListener('storage', syncFromStorage)
      window.removeEventListener('auth-change', syncFromStorage)
    }
  }, [syncFromStorage])

  const login = useCallback(
    async ({ email, password }) => {
      const data = await loginUserRequest({ email, password })
      setUser(data.user)
      window.dispatchEvent(new Event('auth-change'))
      pushToast(`Selamat datang kembali, ${data.user.name}.`, 'success')
      return data
    },
    [pushToast],
  )

  const logout = useCallback(
    ({ silent = false } = {}) => {
      logoutUserRequest()
      setUser(null)
      window.dispatchEvent(new Event('auth-change'))
      if (!silent) pushToast('Anda telah keluar dari akun.', 'success')
    },
    [pushToast],
  )

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user) && Boolean(getAuthToken()),
      login,
      logout,
      pushToast,
    }),
    [user, login, logout, pushToast],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  }
  return ctx
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-5 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => onDismiss(t.id)}
            className={`pointer-events-auto max-w-sm w-full sm:w-auto rounded-full px-5 py-3 text-sm font-medium text-center shadow-lg shadow-navy-900/10 cursor-pointer ${
              t.tone === 'error' ? 'bg-maroon-600 text-cream-50' : 'bg-navy-900 text-cream-50'
            }`}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Dipakai internal saja supaya lint tidak komplain unused export bila
// suatu saat file lain butuh nama key-nya tanpa import dari usersApi.
export { AUTH_TOKEN_KEY, AUTH_USER_KEY }
