import { useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { ICON_NAMES } from '../lib/icons'
import { resolveIcon } from '../lib/resolveIcon'
import { DynamicIcon } from '../lib/DynamicIcon'
import { useClickOutside } from '../hooks/useClickOutside'

interface IconPickerProps {
  value: string
  onChange: (name: string) => void
  error?: string
}

export default function IconPicker({ value, onChange, error }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useClickOutside(containerRef, () => setOpen(false))

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ICON_NAMES
    return ICON_NAMES.filter((name) => name.toLowerCase().includes(q))
  }, [query])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`field-input flex items-center justify-between gap-2 text-left ${error ? 'border-maroon-400' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-700">
            <DynamicIcon name={value || 'HelpCircle'} size={16} />
          </span>
          <span className="truncate">{value || 'Pilih ikon...'}</span>
        </span>
        <ChevronDown size={16} className="shrink-0 text-navy-400" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-navy-100 bg-white shadow-xl shadow-navy-900/10 overflow-hidden">
          <div className="p-2.5 border-b border-navy-50">
            <div className="relative">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-300" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari ikon..."
                className="w-full rounded-lg border border-navy-100 bg-navy-50/50 pl-8 pr-3 py-2 text-sm focus:border-gold-400 outline-none"
              />
            </div>
          </div>
          <div role="listbox" className="max-h-56 overflow-y-auto p-2 grid grid-cols-5 gap-1">
            {filtered.length === 0 && (
              <p className="col-span-5 py-4 text-center text-xs text-navy-400">Tidak ada ikon yang cocok.</p>
            )}
            {filtered.map((name) => {
              const Icon = resolveIcon(name)
              const selected = name === value
              return (
                <button
                  key={name}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  title={name}
                  onClick={() => {
                    onChange(name)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={`flex flex-col items-center gap-1 rounded-lg py-2.5 transition-colors ${
                    selected ? 'bg-navy-900 text-cream-50' : 'text-navy-600 hover:bg-navy-50'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
