import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import DatePicker from './DatePicker'

const meta: Meta<typeof DatePicker> = {
  title: 'Plus/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DatePicker>

export const Uncontrolled: Story = {
  render: () => <DatePicker />,
}

export const ControlledComposable: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(null)

    return (
      <DatePicker value={date ?? undefined} onChange={nextDate => setDate(nextDate)}>
        <DatePicker.Input />
        <DatePicker.Calendar>
          <DatePicker.CalendarHeader />
          <DatePicker.CalendarGrid />
        </DatePicker.Calendar>
      </DatePicker>
    )
  },
}

export const BoundedBusinessDays: Story = {
  render: () => (
    <DatePicker
      minDate={new Date(2024, 0, 5)}
      maxDate={new Date(2024, 0, 20)}
      blockWeekends
    />
  ),
}
