import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: '.',
  base: '/fullstack_boilerplate/', // sesuai nama repo GitHub kamu
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'frontend-index.html')
      }
    },
    outDir: 'frontend-dist',
    emptyOutDir: true
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources/js/src')  // <-- UPDATE PENTING!
    }
  }
})
