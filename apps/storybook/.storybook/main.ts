import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = resolve(__dirname, '../../..')

const config: StorybookConfig = {
  stories: [
    `${repoRoot}/packages/core/src/components/**/*.stories.@(ts|tsx)`,
    `${repoRoot}/packages/plus/src/components/**/*.stories.@(ts|tsx)`,
  ],
  addons: ['@chromatic-com/storybook', '@storybook/addon-docs'],

  framework: {
    name: '@storybook/react-vite',
    options: {}
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript'
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@core': resolve(repoRoot, 'packages/core/src'),
      '@plus': resolve(repoRoot, 'packages/plus/src'),
    }
    return config
  }
};
export default config;
