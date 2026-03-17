import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import path from 'path'

export default defineConfig({
  test: {
    include: ['**/*.browser.test.ts', '**/*.browser.test.tsx'],
    setupFiles: './setupTests.ts',
    browser: {
      enabled: true,
      provider: playwright(),
      // https://vitest.dev/config/browser/playwright
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
  },
  resolve: {
    alias: {
      '@qube3s/react-datepicker-core': path.resolve(__dirname, 'packages/core/src'),
      '@qube3s/react-datepicker-plus': path.resolve(__dirname, 'packages/plus/src'),
    },
  },
})
