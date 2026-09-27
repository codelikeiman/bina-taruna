import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Lihat catatan API_PROXY_TARGET yang sama di ../vite.config.js.
const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? 'http://localhost:4000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    // Meneruskan /api ke backend Express saat development, supaya admin app
    // bisa memanggil fetch('/api/...') tanpa peduli host:port backend, dan
    // tanpa perlu konfigurasi CORS terpisah untuk tiap developer.
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
      },
    },
  },
})
