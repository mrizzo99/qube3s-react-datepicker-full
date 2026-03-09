import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      codePanel: true,
      source: {
        type: 'dynamic',
      },
    },
  },
}

export default preview
