// Daftar 38 provinsi Indonesia (per pemekaran Papua 2022/2023), diurutkan
// geografis barat ke timur — urutan yang lazim dipakai formulir instansi
// pemerintah, lebih mudah ditelusuri mata daripada alfabetis untuk daftar
// sepanjang ini.
export const PROVINCES = [
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Kepulauan Riau',
  'Jambi',
  'Bengkulu',
  'Sumatera Selatan',
  'Kepulauan Bangka Belitung',
  'Lampung',
  'DKI Jakarta',
  'Jawa Barat',
  'Banten',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Sulawesi Tengah',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Sulawesi Barat',
  'Gorontalo',
  'Maluku',
  'Maluku Utara',
  'Papua',
  'Papua Barat',
  'Papua Barat Daya',
  'Papua Tengah',
  'Papua Pegunungan',
  'Papua Selatan',
]

// Sesuai kolom "Agama" yang diakui di dokumen kependudukan Indonesia,
// termasuk "Kepercayaan Terhadap Tuhan YME" (putusan MK No. 97/PUU-XIV/2016).
// HARUS identik dengan RELIGION_OPTIONS di server/src/modules/ppdb/ppdb.types.ts.
export const RELIGIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu', 'Kepercayaan Terhadap Tuhan YME']

export const GENDERS = [
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' },
]
