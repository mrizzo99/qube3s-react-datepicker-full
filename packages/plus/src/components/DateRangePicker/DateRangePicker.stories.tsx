import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import DateRangePicker from './DateRangePicker'
import { esI18n } from '@core/i18n-presets'
import type { DateRange } from '../../headless/useRangeCalendar'

const meta: Meta<typeof DateRangePicker> = {
  title: 'DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DateRangePicker>

export const Uncontrolled: Story = {
  render: () => <DateRangePicker />,
}

export const TwoMonthView: Story = {
  render: () => <DateRangePicker numberOfMonths={2} />,
}

export const ThreeMonthView: Story = {
  render: () => <DateRangePicker numberOfMonths={3} />,
}

export const ControlledComposable: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange>({ start: null, end: null })

    return (
      <DateRangePicker value={range} onChange={setRange}>
        <DateRangePicker.Input />
        <DateRangePicker.Calendar>
          <DateRangePicker.CalendarHeader />
          <DateRangePicker.CalendarGrid />
        </DateRangePicker.Calendar>
      </DateRangePicker>
    )
  },
}

export const SpanishI18n: Story = {
  render: () => <DateRangePicker i18n={esI18n} />,
}

export const DateTimeRange24Hour: Story = {
  render: () => (
    <DateRangePicker
      enableTime
      timeFormat="24h"
      defaultStartTime="08:30"
      defaultEndTime="17:00"
    />
  ),
}
