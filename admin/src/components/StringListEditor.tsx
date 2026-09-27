import { useState, type KeyboardEvent } from 'react'
import { Plus, X } from 'lucide-react'

interface StringListEditorProps {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  error?: string
}

export default function StringListEditor({ value, onChange, placeholder, error }: StringListEditorProps) {
  const [draft, setDraft] = useState('')

  const addDraft = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onChange([...value, trimmed])
    setDraft('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addDraft()
    }
  }

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2.5">
          {value.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 border border-navy-100 pl-3 pr-1.5 py-1 text-sm text-navy-800"
            >
              {item}
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Hapus ${item}`}
                className="flex h-5 w-5 items-center justify-center rounded-full text-navy-400 hover:bg-navy-200 hover:text-navy-700 transition-colors"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'Ketik lalu tekan Enter...'}
          className={`field-input flex-1 ${error ? 'border-maroon-400' : ''}`}
        />
        <button type="button" onClick={addDraft} className="btn-secondary shrink-0 px-3.5">
          <Plus size={16} />
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
