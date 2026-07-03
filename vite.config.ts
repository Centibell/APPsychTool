import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Static, no-backend build. WebLLM (added in Phase 5) is code-split so
// non-quiz users never download it.
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Pre-bundle heavy deps at server start so the first import doesn't trigger a
  // mid-render re-optimization reload.
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'zustand',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
    ],
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Split heavy vendor code so the browser caches it across deploys.
        // WebLLM stays a lazy chunk via its dynamic import (not listed here).
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('three') || id.includes('@react-three')) return 'three-vendor'
          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor'
        },
      },
    },
  },
})
