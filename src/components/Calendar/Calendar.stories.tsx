
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { format } from 'date-fns'
import Calendar from './Calendar'

const meta: Meta<typeof Calendar> = {
  title: 'Calendar',
  component: Calendar,
  argTypes: {
    selectedDate: { control: false },
    selectDate: { control: false }
  }
}

export default meta
type Story = StoryObj<typeof Calendar>

export const Uncontrolled: Story = {
  render: () => <Calendar />
}

export const Controlled: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

    return (
      <div className="space-y-2">
        <Calendar selectedDate={selectedDate} selectDate={setSelectedDate} />
        <div className="text-sm text-gray-600">
          {selectedDate ? `Selected: ${format(selectedDate, 'PPP')}` : 'No date selected'}
        </div>
      </div>
    )
  }
}

export const Range: Story = {
  render: () => {
    const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
      start: null,
      end: null
    })

    return (
      <div className="space-y-2">
        <Calendar mode="range" selectedRange={range} selectRange={setRange} />
        <div className="text-sm text-gray-600">
          {range.start ? `Start: ${format(range.start, 'PPP')}` : 'Start: —'}
          {'  '}
          {range.end ? `End: ${format(range.end, 'PPP')}` : 'End: —'}
        </div>
      </div>
    )
  }
}
