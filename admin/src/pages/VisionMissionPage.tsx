import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { visionApi, resourceApi, ApiError } from '../lib/api'
import type { ResourceItem } from '../types/resource'
import { useToast } from '../context/ToastContext'
import ConfirmDialog from '../components/ConfirmDialog'

const MISSIONS_KEY = 'missions'

export default function VisionMissionPage() {
  const { showSuccess, showError } = useToast()

  const [vision, setVision] = useState('')
  const [visionDraft, setVisionDraft] = useState('')
  const [missions, setMissions] = useState<ResourceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSavingVision, setIsSavingVision] = useState(false)
  const [visionError, setVisionError] = useState<string | null>(null)

  const [missionDraft, setMissionDraft] = useState<{ mode: 'create' } | { mode: 'edit'; item: ResourceItem } | null>(null)
  const [missionText, setMissionText] = useState('')
  const [missionError, setMissionError] = useState<string | null>(null)
  const [isSavingMission, setIsSavingMission] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ResourceItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reorderingId, setReorderingId] = useState<number | null>(null)

  useEffect(() => {
    visionApi
      .get()
      .then(({ vision, missions }) => {
        setVision(vision)
        setVisionDraft(vision)
        setMissions(missions)
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : 'Gagal memuat data.'))
      .finally(() => setIsLoading(false))
  }, [])

  const handleSaveVision = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = visionDraft.trim()
    if (!trimmed) {
      setVisionError('Visi wajib diisi.')
      return
    }
    setIsSavingVision(true)
    setVisionError(null)
    try {
      const { vision: saved } = await visionApi.updateVision(trimmed)
      setVision(saved)
      setVisionDraft(saved)
      showSuccess('Visi berhasil disimpan.')
    } catch (err) {
      if (err instanceof ApiError) {
        setVisionError(err.fields?.vision ?? err.message)
      } else {
        showError('Tidak dapat terhubung ke server.')
      }
    } finally {
      setIsSavingVision(false)
    }
  }

  const openCreateMission = () => {
    setMissionText('')
    setMissionError(null)
    setMissionDraft({ mode: 'create' })
  }

  const openEditMission = (item: ResourceItem) => {
    setMissionText(String(item.content ?? ''))
    setMissionError(null)
    setMissionDraft({ mode: 'edit', item })
  }

  const handleSaveMission = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = missionText.trim()
    if (!trimmed) {
      setMissionError('Isi misi wajib diisi.')
      return
    }
    setIsSavingMission(true)
    setMissionError(null)
    try {
      if (missionDraft?.mode === 'create') {
        const { item } = await resourceApi.create(MISSIONS_KEY, { content: trimmed })
        setMissions((prev) => [...prev, item])
        showSuccess('Misi berhasil ditambahkan.')
      } else if (missionDraft?.mode === 'edit') {
        const { item } = await resourceApi.update(MISSIONS_KEY, missionDraft.item.id, { content: trimmed })
        setMissions((prev) => prev.map((m) => (m.id === item.id ? item : m)))
        showSuccess('Misi berhasil diperbarui.')
      }
      setMissionDraft(null)
    } catch (err) {
      if (err instanceof ApiError) {
        setMissionError(err.fields?.content ?? err.message)
      } else {
        showError('Tidak dapat terhubung ke server.')
      }
    } finally {
      setIsSavingMission(false)
    }
  }

  const handleDeleteMission = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await resourceApi.remove(MISSIONS_KEY, deleteTarget.id)
      setMissions((prev) => prev.filter((m) => m.id !== deleteTarget.id))
      showSuccess('Misi berhasil dihapus.')
      setDeleteTarget(null)
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Gagal menghapus misi.')
    } finally {
      setIsDeleting(false)
    }
  }

  const moveMission = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= missions.length) return
    const reordered = [...missions]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)
    setMissions(reordered)
    setReorderingId(moved.id)
    try {
      const { items } = await resourceApi.reorder(MISSIONS_KEY, reordered.map((m) => m.id))
      setMissions(items)
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Gagal mengubah urutan.')
      visionApi.get().then(({ missions }) => setMissions(missions))
    } finally {
      setReorderingId(null)
    }
  }

  if (isLoading) return <div className="card p-10 text-center text-sm text-navy-400">Memuat data...</div>
  if (loadError) return <div className="card p-10 text-center text-sm text-maroon-500">{loadError}</div>

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-navy-900">Visi &amp; Misi</h1>
      <p className="mt-1 text-sm text-navy-500 mb-6">Ditampilkan di bagian "Visi &amp; Misi" pada situs publik.</p>

      <form onSubmit={handleSaveVision} className="card p-5 mb-6 space-y-3">
        <h2 className="text-sm font-semibold text-navy-800 uppercase tracking-wide">Visi</h2>
        <textarea
          className={`field-input resize-y ${visionError ? 'border-maroon-400' : ''}`}
          rows={3}
          maxLength={2000}
          value={visionDraft}
          onChange={(e) => {
            setVisionDraft(e.target.value)
            setVisionError(null)
          }}
        />
        {visionError && <p className="field-error">{visionError}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={isSavingVision || visionDraft === vision} className="btn-primary">
            {isSavingVision ? 'Menyimpan...' : 'Simpan Visi'}
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-navy-800 uppercase tracking-wide">Misi</h2>
        <button type="button" onClick={openCreateMission} className="btn-secondary !py-2 !px-3 text-xs">
          <Plus size={14} />
          Tambah Misi
        </button>
      </div>

      {missions.length === 0 ? (
        <div className="card p-8 text-center text-sm text-navy-400">Belum ada misi ditambahkan.</div>
      ) : (
        <ol className="card divide-y divide-navy-50 overflow-hidden">
          {missions.map((mission, index) => (
            <li
              key={mission.id}
              className={`flex items-start gap-3 px-4 py-3.5 sm:px-5 transition-opacity ${reorderingId === mission.id ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col shrink-0 pt-0.5">
                <button
                  type="button"
                  onClick={() => moveMission(index, -1)}
                  disabled={index === 0}
                  aria-label="Naikkan urutan"
                  className="btn-icon !p-1"
                >
                  <ChevronUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => moveMission(index, 1)}
                  disabled={index === missions.length - 1}
                  aria-label="Turunkan urutan"
                  className="btn-icon !p-1"
                >
                  <ChevronDown size={15} />
                </button>
              </div>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-700 text-xs font-semibold mt-0.5">
                {index + 1}
              </span>
              <p className="flex-1 text-sm text-navy-800 leading-relaxed pt-0.5">{String(mission.content ?? '')}</p>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => openEditMission(mission)} aria-label="Ubah misi" className="btn-icon">
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(mission)}
                  aria-label="Hapus misi"
                  className="btn-icon hover:!bg-maroon-50 hover:!text-maroon-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {missionDraft && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <button type="button" aria-label="Tutup" onClick={() => setMissionDraft(null)} className="absolute inset-0 bg-navy-950/50" />
          <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl p-6">
            <h2 className="font-display text-lg font-semibold text-navy-900 mb-4">
              {missionDraft.mode === 'create' ? 'Tambah Misi' : 'Ubah Misi'}
            </h2>
            <form onSubmit={handleSaveMission} className="space-y-4">
              <div>
                <label className="field-label">Isi Misi</label>
                <textarea
                  autoFocus
                  className={`field-input resize-y ${missionError ? 'border-maroon-400' : ''}`}
                  rows={3}
                  maxLength={1000}
                  value={missionText}
                  onChange={(e) => {
                    setMissionText(e.target.value)
                    setMissionError(null)
                  }}
                />
                {missionError && <p className="field-error">{missionError}</p>}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setMissionDraft(null)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isSavingMission} className="btn-primary">
                  {isSavingMission ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Hapus Misi?"
          description="Misi ini akan dihapus permanen dan langsung hilang dari situs publik."
          isSubmitting={isDeleting}
          onConfirm={handleDeleteMission}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
