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

export const AsyncValidationBlocking: Story = {
  render: () => (
    <DatePicker
      validateAsync={async (date) => {
        await new Promise(resolve => window.setTimeout(resolve, 700))
        if (date.getDay() === 0) {
          return { valid: false, message: 'Server rejected Sundays for this workflow.' }
        }
        return { valid: true }
      }}
    />
  ),
}
