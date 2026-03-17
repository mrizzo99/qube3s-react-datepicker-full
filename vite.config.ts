import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@qube3s/react-datepicker-core': path.resolve(__dirname, 'packages/core/src'),
      '@qube3s/react-datepicker-plus': path.resolve(__dirname, 'packages/plus/src'),
    },
  },
})
