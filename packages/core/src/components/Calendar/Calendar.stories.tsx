
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { format } from 'date-fns'
import Calendar from './Calendar'

const meta: Meta<typeof Calendar> = {
  title: 'Core/Calendar',
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

export const LightAndDark: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-900">
        <p className="mb-3 text-sm font-medium text-slate-700">Light appearance</p>
        <Calendar appearance="light" />
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100">
        <p className="mb-3 text-sm font-medium text-slate-300">Dark appearance</p>
        <Calendar appearance="dark" />
      </div>
    </div>
  )
}
