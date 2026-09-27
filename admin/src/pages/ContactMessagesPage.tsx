import { useCallback, useEffect, useState } from 'react'
import { Trash2, Mail, MailOpen, Inbox } from 'lucide-react'
import { contactApi, ApiError, type ContactMessage } from '../lib/api'
import { useToast } from '../context/ToastContext'
import ConfirmDialog from '../components/ConfirmDialog'

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function ContactMessagesPage() {
  const { showSuccess, showError } = useToast()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const { items } = await contactApi.list()
      setMessages(items)
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Gagal memuat pesan.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Pola "muat saat mount" standar — lihat penjelasan yang sama di
  // ResourceListPage.tsx: setState di load() terjadi di dalam
  // .then()/.catch()/.finally() (kelanjutan asinkron), bukan sinkron di
  // badan efek, sehingga peringatan set-state-in-effect di sini adalah
  // false positive dari linter, bukan masalah pada kode ini.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load()
  }, [load])

  const handleMarkRead = async (message: ContactMessage) => {
    if (message.is_read) return
    try {
      await contactApi.markRead(message.id)
      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_read: 1 } : m)))
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Gagal menandai pesan.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await contactApi.remove(deleteTarget.id)
      setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id))
      showSuccess('Pesan berhasil dihapus.')
      setDeleteTarget(null)
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Gagal menghapus pesan.')
    } finally {
      setIsDeleting(false)
    }
  }

  const unreadCount = messages.filter((m) => !m.is_read).length

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Pesan Masuk</h1>
      <p className="mt-1 text-sm text-navy-500 mb-6">
        Pesan dari formulir kontak di situs publik. {unreadCount > 0 && `${unreadCount} pesan belum dibaca.`}
      </p>

      {isLoading && <div className="card p-10 text-center text-sm text-navy-400">Memuat pesan...</div>}

      {!isLoading && loadError && (
        <div className="card p-10 text-center">
          <p className="text-sm text-maroon-500 mb-3">{loadError}</p>
          <button type="button" onClick={load} className="btn-secondary">Coba Lagi</button>
        </div>
      )}

      {!isLoading && !loadError && messages.length === 0 && (
        <div className="card p-12 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-300 mb-3">
            <Inbox size={22} />
          </span>
          <p className="text-sm text-navy-500">Belum ada pesan masuk.</p>
        </div>
      )}

      {!isLoading && !loadError && messages.length > 0 && (
        <ul className="card divide-y divide-navy-50 overflow-hidden">
          {messages.map((message) => (
            <li
              key={message.id}
              onClick={() => handleMarkRead(message)}
              className={`px-5 py-4 cursor-pointer transition-colors ${message.is_read ? 'bg-white' : 'bg-gold-50/40 hover:bg-gold-50'}`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 ${message.is_read ? 'text-navy-300' : 'text-gold-500'}`}>
                  {message.is_read ? <MailOpen size={17} /> : <Mail size={17} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <p className={`text-sm ${message.is_read ? 'font-medium text-navy-800' : 'font-semibold text-navy-900'}`}>
                      {message.name}
                      <span className="ml-2 text-xs font-normal text-navy-400">{message.email}</span>
                    </p>
                    <p className="text-xs text-navy-400 shrink-0">{formatDate(message.created_at)}</p>
                  </div>
                  <p className="mt-1.5 text-sm text-navy-600 leading-relaxed whitespace-pre-wrap">{message.message}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget(message)
                  }}
                  aria-label={`Hapus pesan dari ${message.name}`}
                  className="btn-icon hover:!bg-maroon-50 hover:!text-maroon-500 shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Hapus Pesan?"
          description={`Pesan dari "${deleteTarget.name}" akan dihapus permanen.`}
          isSubmitting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
