import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string
  isSubmitting?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Hapus',
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button type="button" aria-label="Batal" onClick={onCancel} className="absolute inset-0 bg-navy-950/50" />
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-maroon-50 text-maroon-500 mb-4">
          <AlertTriangle size={22} strokeWidth={1.75} />
        </div>
        <h2 className="font-display text-lg font-semibold text-navy-900">{title}</h2>
        <p className="mt-1.5 text-sm text-navy-500 leading-relaxed">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>
            Batal
          </button>
          <button type="button" onClick={onConfirm} className="btn-danger" disabled={isSubmitting}>
            {isSubmitting ? 'Menghapus...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
