import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Inbox } from 'lucide-react'
import type { ResourceDef } from '../../types/resource'
import type { ResourceItem } from '../../types/resource'
import { resourceApi, ApiError } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { DynamicIcon } from '../../lib/DynamicIcon'
import ResourceForm from '../../components/ResourceForm'
import ConfirmDialog from '../../components/ConfirmDialog'
import { emptyFormValues, itemToFormValues, type FormValues } from '../../lib/validateResource'

interface ResourceListPageProps {
  resource: ResourceDef
}

export default function ResourceListPage({ resource }: ResourceListPageProps) {
  const { showSuccess, showError } = useToast()

  const [items, setItems] = useState<ResourceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [formState, setFormState] = useState<
    { mode: 'create' } | { mode: 'edit'; item: ResourceItem } | null
  >(null)
  const [deleteTarget, setDeleteTarget] = useState<ResourceItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reorderingId, setReorderingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const { items } = await resourceApi.list(resource.key)
      setItems(items)
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Gagal memuat data.')
    } finally {
      setIsLoading(false)
    }
  }, [resource.key])

  // Pola "muat saat mount" standar. Linter set-state-in-effect salah
  // mendeteksi ini karena tidak menelusuri lewat batas async/useCallback:
  // setState di load() terjadi di dalam .then()/finally() (kelanjutan
  // asinkron), bukan sinkron di badan efek — justru inilah kegunaan efek
  // ini (menyinkronkan dengan sumber data eksternal), bukan pengulangan
  // nilai yang sudah diketahui saat render. Lihat catatan di dokumentasi
  // rule ini soal false positive pada fetch yang dibungkus fungsi async.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load()
  }, [load])

  const handleCreate = async (payload: Record<string, unknown>) => {
    const { item } = await resourceApi.create(resource.key, payload)
    setItems((prev) => [...prev, item])
    setFormState(null)
    showSuccess(`${resource.labelSingular} berhasil ditambahkan.`)
  }

  const handleUpdate = async (id: number, payload: Record<string, unknown>) => {
    const { item } = await resourceApi.update(resource.key, id, payload)
    setItems((prev) => prev.map((it) => (it.id === id ? item : it)))
    setFormState(null)
    showSuccess(`${resource.labelSingular} berhasil diperbarui.`)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await resourceApi.remove(resource.key, deleteTarget.id)
      setItems((prev) => prev.filter((it) => it.id !== deleteTarget.id))
      showSuccess(`${resource.labelSingular} berhasil dihapus.`)
      setDeleteTarget(null)
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Gagal menghapus data.')
    } finally {
      setIsDeleting(false)
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= items.length) return

    const reordered = [...items]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    setItems(reordered) // optimistic
    setReorderingId(moved.id)
    try {
      const { items: saved } = await resourceApi.reorder(
        resource.key,
        reordered.map((it) => it.id),
      )
      setItems(saved)
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Gagal mengubah urutan.')
      load() // revert to server truth
    } finally {
      setReorderingId(null)
    }
  }

  const initialValues: FormValues =
    formState?.mode === 'edit' ? itemToFormValues(resource, formState.item) : emptyFormValues(resource)

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-900">{resource.label}</h1>
          <p className="mt-1 text-sm text-navy-500">
            {items.length} {items.length === 1 ? 'data' : 'data'} · gunakan panah untuk mengubah urutan tampil di situs.
          </p>
        </div>
        <button type="button" onClick={() => setFormState({ mode: 'create' })} className="btn-primary shrink-0">
          <Plus size={16} />
          Tambah
        </button>
      </div>

      {isLoading && (
        <div className="card p-10 text-center text-sm text-navy-400">Memuat data...</div>
      )}

      {!isLoading && loadError && (
        <div className="card p-10 text-center">
          <p className="text-sm text-maroon-500 mb-3">{loadError}</p>
          <button type="button" onClick={load} className="btn-secondary">
            Coba Lagi
          </button>
        </div>
      )}

      {!isLoading && !loadError && items.length === 0 && (
        <div className="card p-12 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-300 mb-3">
            <Inbox size={22} />
          </span>
          <p className="text-sm text-navy-500 mb-4">Belum ada data {resource.label.toLowerCase()}.</p>
          <button type="button" onClick={() => setFormState({ mode: 'create' })} className="btn-secondary">
            <Plus size={15} />
            Tambah {resource.labelSingular} Pertama
          </button>
        </div>
      )}

      {!isLoading && !loadError && items.length > 0 && (
        <ul className="card divide-y divide-navy-50 overflow-hidden">
          {items.map((item, index) => (
            <ResourceRow
              key={item.id}
              resource={resource}
              item={item}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              isReordering={reorderingId === item.id}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
              onEdit={() => setFormState({ mode: 'edit', item })}
              onDelete={() => setDeleteTarget(item)}
            />
          ))}
        </ul>
      )}

      {formState && (
        <ResourceForm
          resource={resource}
          mode={formState.mode}
          initialValues={initialValues}
          onClose={() => setFormState(null)}
          onSubmit={(payload) =>
            formState.mode === 'create' ? handleCreate(payload) : handleUpdate(formState.item.id, payload)
          }
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Hapus ${resource.labelSingular}?`}
          description={`"${String(deleteTarget[resource.titleField] ?? '')}" akan dihapus permanen dan langsung hilang dari situs publik. Tindakan ini tidak dapat dibatalkan.`}
          isSubmitting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

function ResourceRow({
  resource,
  item,
  isFirst,
  isLast,
  isReordering,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: {
  resource: ResourceDef
  item: ResourceItem
  isFirst: boolean
  isLast: boolean
  isReordering: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const iconField = resource.fields.find((f) => f.type === 'icon')
  const iconValue = iconField ? String(item[iconField.name] ?? '') : null

  const title = String(item[resource.titleField] ?? '')
  const subtitle = resource.subtitleField ? String(item[resource.subtitleField] ?? '') : null

  return (
    <li className={`flex items-center gap-3 px-4 py-3.5 sm:px-5 transition-opacity ${isReordering ? 'opacity-50' : ''}`}>
      <div className="flex flex-col shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst || isReordering}
          aria-label="Naikkan urutan"
          className="btn-icon !p-1"
        >
          <ChevronUp size={15} />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast || isReordering}
          aria-label="Turunkan urutan"
          className="btn-icon !p-1"
        >
          <ChevronDown size={15} />
        </button>
      </div>

      {iconValue && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
          <DynamicIcon name={iconValue} size={17} />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-navy-900 truncate">{title || '(kosong)'}</p>
        {subtitle && <p className="text-xs text-navy-400 truncate mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button type="button" onClick={onEdit} aria-label={`Ubah ${title}`} className="btn-icon">
          <Pencil size={16} />
        </button>
        <button type="button" onClick={onDelete} aria-label={`Hapus ${title}`} className="btn-icon hover:!bg-maroon-50 hover:!text-maroon-500">
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  )
}
