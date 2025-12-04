import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import DateRangeInput from './DateRangeInput'

const meta: Meta<typeof DateRangeInput> = {
  title: 'DateRangeInput',
  component: DateRangeInput,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof DateRangeInput>

export const Uncontrolled: Story = {
  render: () => <DateRangeInput />
}

export const Controlled: Story = {
  render: () => {
    const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
      start: null,
      end: null
    })
    return <DateRangeInput value={range} onChange={setRange} />
  }
}
