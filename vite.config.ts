import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: [
        'src/utils/session.ts',
        'src/utils/errors.ts',
        'src/components/ui/Input.tsx',
        'src/components/RouteMetadata.tsx',
        'src/components/ConnectionBanner.tsx',
        'src/components/layout/Navbar.tsx',
      ],
      reporter: ['text', 'json-summary', 'lcov'],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 80,
      },
    },
  },
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
