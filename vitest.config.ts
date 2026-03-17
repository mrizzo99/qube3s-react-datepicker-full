import { configDefaults, defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './setupTests.ts',
    exclude: [...configDefaults.exclude, '**/*.browser.test.ts', '**/*.browser.test.tsx'],
  },
  resolve: {
    alias: {
      '@qube3s/react-datepicker-core': path.resolve(__dirname, 'packages/core/src'),
      '@qube3s/react-datepicker-plus': path.resolve(__dirname, 'packages/plus/src'),
    },
  },
})
