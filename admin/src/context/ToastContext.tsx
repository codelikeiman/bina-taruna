import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

interface Toast {
  id: number
  kind: 'success' | 'error'
  message: string
}

interface ToastContextValue {
  showSuccess: (message: string) => void
  showError: (message: string) => void
}

// Sama seperti AuthContext.tsx: Provider dan hook useToast() sengaja
// disatukan di sini meski mengorbankan fast refresh pada file ini.
const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (kind: Toast['kind'], message: string) => {
      const id = nextId++
      setToasts((prev) => [...prev, { id, kind, message }])
      window.setTimeout(() => dismiss(id), 4500)
    },
    [dismiss],
  )

  const showSuccess = useCallback((message: string) => push('success', message), [push])
  const showError = useCallback((message: string) => push('error', message), [push])

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-[min(380px,calc(100vw-2.5rem))]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 shadow-lg shadow-navy-900/10 ${
              toast.kind === 'success'
                ? 'bg-white border-navy-100'
                : 'bg-white border-maroon-200'
            }`}
          >
            {toast.kind === 'success' ? (
              <CheckCircle2 className="mt-0.5 shrink-0 text-gold-500" size={20} />
            ) : (
              <XCircle className="mt-0.5 shrink-0 text-maroon-500" size={20} />
            )}
            <p className="flex-1 text-sm text-navy-800 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Tutup notifikasi"
              className="shrink-0 text-navy-300 hover:text-navy-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast harus dipakai di dalam <ToastProvider>.')
  return ctx
}
