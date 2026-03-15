import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { format } from 'date-fns'
import type { DateRange } from '../../headless/useRangeCalendar'
import { shadcn } from './index'

const meta: Meta<typeof shadcn.RangeCalendar> = {
  title: 'Plus/Adapters/Shadcn/RangeCalendar',
  component: shadcn.RangeCalendar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof shadcn.RangeCalendar>

export const Uncontrolled: Story = {
  render: () => <shadcn.RangeCalendar />,
}

export const TwoMonthPresets: Story = {
  render: () => <shadcn.RangeCalendar numberOfMonths={2} showPresets />,
}

export const Controlled: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange>({ start: null, end: null })

    return (
      <div className="space-y-3">
        <shadcn.RangeCalendar selectedRange={range} selectRange={setRange} numberOfMonths={2} showPresets />
        <div className="text-sm text-slate-600">
          {range.start ? `Start: ${format(range.start, 'PPP')}` : 'Start: —'}{' '}
          {range.end ? `End: ${format(range.end, 'PPP')}` : 'End: —'}
        </div>
      </div>
    )
  },
}
