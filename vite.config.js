import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import localApiPlugin from './vite-plugin-local-api.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
})
