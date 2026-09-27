import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Target proxy backend saat development. Default localhost:4000 untuk `npm
// run dev` biasa; docker-compose.yml mengisi ini dengan 'http://server:4000'
// (nama service Docker) karena container tidak bisa saling akses lewat
// "localhost" satu sama lain.
const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? 'http://localhost:4000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Meneruskan /api ke backend Express saat development. Di production,
    // atur VITE_API_BASE_URL (lihat src/lib/siteContentApi.js) agar situs
    // yang di-build memanggil URL API yang sesungguhnya.
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
      },
      // Foto & dokumen kini disajikan langsung dari Supabase Storage (lihat
      // src/lib/siteContentApi.js -> resolveMediaUrl), jadi tidak perlu lagi
      // proxy /uploads di sini.
    },
  },
})
