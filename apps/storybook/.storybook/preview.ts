import type { Preview } from '@storybook/react-vite'
import '../../demo/src/index.css'

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
