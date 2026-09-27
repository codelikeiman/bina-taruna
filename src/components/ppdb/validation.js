const PHONE_RE = /^(\+62|62|0)8\d{8,12}$/

/** Peta nama field -> index step, dipakai PpdbWizard untuk melompat ke step yang benar saat server menolak field tertentu (mis. NIK duplikat) setelah user sudah maju ke step berikutnya. */
export const FIELD_STEP_MAP = {
  nik: 0,
  nisn: 0,
  fullName: 0,
  birthPlace: 0,
  birthDate: 0,
  gender: 0,
  religion: 0,
  phone: 0,
  email: 0,
  address: 1,
  province: 1,
  city: 1,
  district: 1,
  village: 1,
  fatherName: 2,
  fatherJob: 2,
  fatherPhone: 2,
  motherName: 2,
  motherJob: 2,
  motherPhone: 2,
  guardianName: 2,
  guardianRelationship: 2,
  guardianJob: 2,
  guardianPhone: 2,
  majorId: 3,
  previousSchool: 3,
  kk: 4,
  akta: 4,
  ijazah: 4,
  foto: 4,
  agreementAccepted: 5,
}

export function validateStep(step, data, files, majors) {
  const errors = {}
  const require = (field, message) => {
    if (!String(data[field] ?? '').trim()) errors[field] = message
  }

  if (step === 0) {
    if (!/^\d{16}$/.test(data.nik)) errors.nik = 'NIK harus 16 digit angka.'
    if (!/^\d{10}$/.test(data.nisn)) errors.nisn = 'NISN harus 10 digit angka.'
    require('fullName', 'Nama lengkap wajib diisi.')
    require('birthPlace', 'Tempat lahir wajib diisi.')
    require('birthDate', 'Tanggal lahir wajib diisi.')
    require('gender', 'Pilih jenis kelamin.')
    require('religion', 'Pilih agama.')
    if (!PHONE_RE.test(data.phone)) errors.phone = 'Nomor HP/WhatsApp tidak valid.'
    if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = 'Alamat email tidak valid.'
  }

  if (step === 1) {
    require('address', 'Alamat wajib diisi.')
    require('province', 'Pilih provinsi.')
    require('city', 'Kabupaten/Kota wajib diisi.')
    require('district', 'Kecamatan wajib diisi.')
    require('village', 'Kelurahan/Desa wajib diisi.')
  }

  if (step === 2) {
    require('fatherName', 'Nama ayah wajib diisi.')
    require('fatherJob', 'Pekerjaan ayah wajib diisi.')
    if (!PHONE_RE.test(data.fatherPhone)) errors.fatherPhone = 'Nomor HP ayah tidak valid.'
    require('motherName', 'Nama ibu wajib diisi.')
    require('motherJob', 'Pekerjaan ibu wajib diisi.')
    if (!PHONE_RE.test(data.motherPhone)) errors.motherPhone = 'Nomor HP ibu tidak valid.'
    if (data.hasGuardian) {
      require('guardianName', 'Nama wali wajib diisi.')
      require('guardianRelationship', 'Hubungan dengan siswa wajib diisi.')
      require('guardianJob', 'Pekerjaan wali wajib diisi.')
      if (!PHONE_RE.test(data.guardianPhone)) errors.guardianPhone = 'Nomor HP wali tidak valid.'
    }
  }

  if (step === 3) {
    if (majors.length > 0) require('majorId', 'Pilih jurusan/peminatan.')
    require('previousSchool', 'Asal sekolah wajib diisi.')
  }

  if (step === 4) {
    if (!files.kk) errors.kk = 'Wajib diunggah.'
    if (!files.akta) errors.akta = 'Wajib diunggah.'
    if (!files.ijazah) errors.ijazah = 'Wajib diunggah.'
    if (!files.foto) errors.foto = 'Wajib diunggah.'
  }

  if (step === 5) {
    if (!data.agreementAccepted) errors.agreementAccepted = 'Anda harus menyetujui pernyataan ini sebelum mengirim.'
  }

  return errors
}
