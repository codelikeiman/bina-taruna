import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { ResourceDef } from '../types/resource'
import IconPicker from './IconPicker'
import ImageUploadField from './ImageUploadField'
import StringListEditor from './StringListEditor'
import {
  type FormValues,
  validateResourceForm,
  formValuesToPayload,
} from '../lib/validateResource'
import { ApiError } from '../lib/api'

interface ResourceFormProps {
  resource: ResourceDef
  mode: 'create' | 'edit'
  initialValues: FormValues
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
  onClose: () => void
}

export default function ResourceForm({ resource, mode, initialValues, onSubmit, onClose }: ResourceFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const setField = (name: string, value: FormValues[string]) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const clientErrors = validateResourceForm(resource, values)
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }

    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit(formValuesToPayload(resource, values))
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fields) setErrors(err.fields)
        setFormError(err.message)
      } else {
        setFormError('Tidak dapat terhubung ke server.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-navy-950/50"
      />
      <div className="relative w-full sm:max-w-lg max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-navy-100 shrink-0">
          <h2 className="font-display text-lg font-semibold text-navy-900">
            {mode === 'create' ? `Tambah ${resource.labelSingular}` : `Ubah ${resource.labelSingular}`}
          </h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="btn-icon">
            <X size={18} />
          </button>
        </div>

        <form id="resource-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-5">
          {formError && (
            <div className="rounded-lg bg-maroon-50 border border-maroon-100 px-3.5 py-3 text-sm text-maroon-600">
              {formError}
            </div>
          )}

          {resource.fields.map((field) => (
            <div key={field.name}>
              <label className="field-label" htmlFor={`field-${field.name}`}>
                {field.label}
                {field.required && <span className="text-maroon-400"> *</span>}
              </label>

              {field.type === 'icon' && (
                <IconPicker
                  value={(values[field.name] as string) ?? ''}
                  onChange={(v) => setField(field.name, v)}
                  error={errors[field.name]}
                />
              )}

              {field.type === 'string-list' && (
                <StringListEditor
                  value={(values[field.name] as string[]) ?? []}
                  onChange={(v) => setField(field.name, v)}
                  error={errors[field.name]}
                />
              )}

              {field.type === 'image' && (
                <ImageUploadField
                  value={(values[field.name] as string) ?? ''}
                  onChange={(v) => setField(field.name, v)}
                  error={errors[field.name]}
                />
              )}

              {field.type === 'text' && (
                <>
                  <textarea
                    id={`field-${field.name}`}
                    value={(values[field.name] as string) ?? ''}
                    onChange={(e) => setField(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    maxLength={field.maxLength}
                    className={`field-input resize-y ${errors[field.name] ? 'border-maroon-400' : ''}`}
                  />
                  {errors[field.name] && <p className="field-error">{errors[field.name]}</p>}
                </>
              )}

              {field.type === 'string' && (
                <>
                  <input
                    id={`field-${field.name}`}
                    type="text"
                    value={(values[field.name] as string) ?? ''}
                    onChange={(e) => setField(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    className={`field-input ${errors[field.name] ? 'border-maroon-400' : ''}`}
                  />
                  {errors[field.name] && <p className="field-error">{errors[field.name]}</p>}
                </>
              )}

              {field.type === 'number' && (
                <>
                  <input
                    id={`field-${field.name}`}
                    type="number"
                    value={values[field.name] as number | string}
                    onChange={(e) => setField(field.name, e.target.value === '' ? '' : Number(e.target.value))}
                    min={field.min}
                    max={field.max}
                    className={`field-input ${errors[field.name] ? 'border-maroon-400' : ''}`}
                  />
                  {errors[field.name] && <p className="field-error">{errors[field.name]}</p>}
                </>
              )}

              {field.hint && <p className="mt-1.5 text-xs text-navy-400 leading-relaxed">{field.hint}</p>}
            </div>
          ))}
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy-100 shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary">
            Batal
          </button>
          <button type="submit" form="resource-form" disabled={submitting} className="btn-primary">
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
