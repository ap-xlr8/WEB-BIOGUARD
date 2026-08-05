import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5057',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:5057',
        changeOrigin: true,
        secure: false,
      },
      '/hubs': {
        target: 'http://localhost:5057',
        changeOrigin: true,
        ws: true,
        secure: false,
      },
    },
  },
})
