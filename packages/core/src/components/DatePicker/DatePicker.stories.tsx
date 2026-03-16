import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import DatePicker from './DatePicker'
import { esI18n } from '@core/i18n-presets'

const meta: Meta<typeof DatePicker> = {
  title: 'Core/DatePicker',
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

export const SpanishI18n: Story = {
  render: () => <DatePicker i18n={esI18n} />,
}
