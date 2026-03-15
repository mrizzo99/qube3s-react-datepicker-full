import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { shadcn } from './index'

const meta: Meta<typeof shadcn.DatePicker> = {
  title: 'Plus/Adapters/Shadcn/DatePicker',
  component: shadcn.DatePicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof shadcn.DatePicker>

export const Uncontrolled: Story = {
  render: () => <shadcn.DatePicker />,
}

export const BoundedBusinessDays: Story = {
  render: () => (
    <shadcn.DatePicker
      minDate={new Date(2024, 0, 5)}
      maxDate={new Date(2024, 0, 20)}
      blockWeekends
    />
  ),
}

export const ControlledComposable: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(null)

    return (
      <shadcn.DatePicker value={date ?? undefined} onChange={nextDate => setDate(nextDate)}>
        <shadcn.DatePicker.Input />
        <shadcn.DatePicker.Calendar>
          <shadcn.DatePicker.CalendarHeader />
          <shadcn.DatePicker.CalendarGrid />
        </shadcn.DatePicker.Calendar>
      </shadcn.DatePicker>
    )
  },
}
