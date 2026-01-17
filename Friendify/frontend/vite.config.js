import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    port: Number(process.env.PORT) || 5173, // fallback to default Vite port
    host: true,                             // listen on all interfaces
    allowedHosts: ["friendify-frontend-h3qi.onrender.com"]                     // allow all hosts (including Render)
  },
  server: {
    host: true, // in case you want to run `vite dev` on Render for testing
    port: Number(process.env.PORT) || 5173,
    strictPort: false
  }
})
