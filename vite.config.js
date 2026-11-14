import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development the API (npm run server) listens on :4000 and is proxied under /api.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:4000' } },
})
