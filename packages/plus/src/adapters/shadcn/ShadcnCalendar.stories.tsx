import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { format } from 'date-fns'
import { shadcn } from './index'

const meta: Meta<typeof shadcn.Calendar> = {
  title: 'Plus/Adapters/Shadcn/Calendar',
  component: shadcn.Calendar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof shadcn.Calendar>

export const Uncontrolled: Story = {
  render: () => <shadcn.Calendar />,
}

export const Controlled: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

    return (
      <div className="space-y-3">
        <shadcn.Calendar selectedDate={selectedDate} selectDate={setSelectedDate} />
        <div className="text-sm text-slate-600">
          {selectedDate ? `Selected: ${format(selectedDate, 'PPP')}` : 'No date selected'}
        </div>
      </div>
    )
  },
}
