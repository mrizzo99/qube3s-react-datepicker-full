import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { format } from 'date-fns'
import { mui } from './index'

const meta: Meta<typeof mui.Calendar> = {
  title: 'Plus/Adapters/Mui/Calendar',
  component: mui.Calendar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof mui.Calendar>

export const Uncontrolled: Story = {
  render: () => <mui.Calendar />,
}

export const Controlled: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

    return (
      <div className="space-y-3">
        <mui.Calendar selectedDate={selectedDate} selectDate={setSelectedDate} />
        <div className="text-sm text-slate-600">
          {selectedDate ? `Selected: ${format(selectedDate, 'PPP')}` : 'No date selected'}
        </div>
      </div>
    )
  },
}
