import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './setupTests.ts',
  },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'packages/core/src'),
      '@plus': path.resolve(__dirname, 'packages/plus/src'),
    },
  },
})
