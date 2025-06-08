// vite.config.js
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // Or 'modules' if you want to be slightly more conservative. Setting to 'esnext' means Vite will produce as modern JS as possible.
    sourcemap: true, // Enable source map generation for production builds. This will generate separate source.map files
  },
})
