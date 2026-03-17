import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { mui } from './index'

const meta: Meta<typeof mui.DatePicker> = {
  title: 'Plus/Adapters/Mui/DatePicker',
  component: mui.DatePicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof mui.DatePicker>

export const Uncontrolled: Story = {
  render: () => <mui.DatePicker />,
}

export const BoundedBusinessDays: Story = {
  render: () => (
    <mui.DatePicker
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
      <mui.DatePicker value={date ?? undefined} onChange={nextDate => setDate(nextDate)}>
        <mui.DatePicker.Input />
        <mui.DatePicker.Calendar>
          <mui.DatePicker.CalendarHeader />
          <mui.DatePicker.CalendarGrid />
        </mui.DatePicker.Calendar>
      </mui.DatePicker>
    )
  },
}
