import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { DateRange } from '../../headless/useRangeCalendar'
import { shadcn } from './index'

const meta: Meta<typeof shadcn.DateRangePicker> = {
  title: 'Plus/Adapters/Shadcn/DateRangePicker',
  component: shadcn.DateRangePicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof shadcn.DateRangePicker>

export const Uncontrolled: Story = {
  render: () => <shadcn.DateRangePicker />,
}

export const PresetsTwoMonths: Story = {
  render: () => <shadcn.DateRangePicker showPresets numberOfMonths={2} />,
}

export const DateTimeRange: Story = {
  render: () => (
    <shadcn.DateRangePicker
      showPresets
      numberOfMonths={2}
      enableTime
      timeFormat="12h"
      defaultStartTime="09:00 AM"
      defaultEndTime="05:00 PM"
    />
  ),
}

export const ControlledComposable: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange>({ start: null, end: null })

    return (
      <shadcn.DateRangePicker value={range} onChange={setRange}>
        <shadcn.DateRangePicker.Input />
        <shadcn.DateRangePicker.Calendar>
          <shadcn.DateRangePicker.CalendarHeader />
          <shadcn.DateRangePicker.CalendarGrid />
        </shadcn.DateRangePicker.Calendar>
      </shadcn.DateRangePicker>
    )
  },
}
