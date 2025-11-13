import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/fullstack_boilerplate/',   // penting untuk GitHub Pages!
  plugins: [react()]
})
