import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { format } from 'date-fns'
import RangeCalendar from './RangeCalendar'
import { fluentAnimationPack } from '../../presets/animationPack'

const meta: Meta<typeof RangeCalendar> = {
  title: 'Plus/RangeCalendar',
  component: RangeCalendar,
  argTypes: {
    selectedRange: { control: false },
    selectRange: { control: false }
  }
}

export default meta
type Story = StoryObj<typeof RangeCalendar>

export const Uncontrolled: Story = {
  render: () => <RangeCalendar />
}

export const TwoMonthView: Story = {
  render: () => <RangeCalendar numberOfMonths={2} />
}

export const ThreeMonthView: Story = {
  render: () => <RangeCalendar numberOfMonths={3} />
}

export const Controlled: Story = {
  render: () => {
    const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
      start: null,
      end: null
    })

    return (
      <div className="space-y-2">
        <RangeCalendar selectedRange={range} selectRange={setRange} />
        <div className="text-sm text-gray-600">
          {range.start ? `Start: ${format(range.start, 'PPP')}` : 'Start: —'}
          {'  '}
          {range.end ? `End: ${format(range.end, 'PPP')}` : 'End: —'}
        </div>
      </div>
    )
  }
}

export const FluentAnimationPack: Story = {
  render: () => <RangeCalendar numberOfMonths={2} skin={fluentAnimationPack.rangeCalendar} />,
}
