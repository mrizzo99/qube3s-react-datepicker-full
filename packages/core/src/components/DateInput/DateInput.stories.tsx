import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import DateInput from './DateInput'

const meta: Meta<typeof DateInput> = {
  title: 'DateInput',
  component: DateInput,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof DateInput>

export const Uncontrolled: Story = { render: () => <DateInput /> }

export const Controlled: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(null)
    return <DateInput value={date ?? undefined} onChange={d => setDate(d)} />
  },
}
