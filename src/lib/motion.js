// Preset animasi Framer Motion yang dipakai berulang di seluruh halaman.
// Diimpor oleh tiap komponen section agar gaya reveal-on-scroll konsisten.

export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

// staggerChildren mengatur jeda antar elemen anak saat animasi berjalan.
// Section dengan banyak item (grid besar) memakai nilai lebih kecil
// supaya total durasi reveal tidak terlalu lama.
export const stagger = (staggerChildren = 0.12, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
})

// Opsi viewport standar: animasi hanya berjalan sekali, dipicu saat
// 25% elemen sudah terlihat di layar.
export const viewportOnce = { once: true, amount: 0.25 }
