import ResourceListPage from './ResourceListPage'
import { resourceDefinitionsByKey } from '../../lib/resourceDefinitions'

/**
 * Dipanggil sekali per resource di App.tsx untuk membuat komponen rute.
 * Melempar error saat build/dev bila `key` salah ketik — lebih baik gagal
 * cepat di sini daripada menampilkan halaman kosong tanpa penjelasan.
 */
export function makeResourcePage(key: string) {
  const resource = resourceDefinitionsByKey.get(key)
  if (!resource) {
    throw new Error(`Resource "${key}" tidak terdaftar di resourceDefinitions.ts`)
  }
  return function ResourcePage() {
    return <ResourceListPage resource={resource} />
  }
}
