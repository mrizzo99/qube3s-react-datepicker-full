import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { DateRange } from '../../headless/useRangeCalendar'
import { mui } from './index'

const meta: Meta<typeof mui.DateRangePicker> = {
  title: 'Plus/Adapters/Mui/DateRangePicker',
  component: mui.DateRangePicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof mui.DateRangePicker>

export const Uncontrolled: Story = {
  render: () => <mui.DateRangePicker />,
}

export const PresetsTwoMonths: Story = {
  render: () => <mui.DateRangePicker showPresets numberOfMonths={2} />,
}

export const DateTimeRange: Story = {
  render: () => (
    <mui.DateRangePicker
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
      <mui.DateRangePicker value={range} onChange={setRange}>
        <mui.DateRangePicker.Input />
        <mui.DateRangePicker.Calendar>
          <mui.DateRangePicker.CalendarHeader />
          <mui.DateRangePicker.CalendarGrid />
        </mui.DateRangePicker.Calendar>
      </mui.DateRangePicker>
    )
  },
}
