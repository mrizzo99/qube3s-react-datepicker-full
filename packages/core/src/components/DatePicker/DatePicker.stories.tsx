import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import DatePicker from './DatePicker'
import { esI18n } from '@qube3s/react-datepicker-core/i18n-presets'

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

export const LightAndDark: Story = {
  render: () => (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-900">
        <p className="mb-3 text-sm font-medium text-slate-700">Light appearance</p>
        <DatePicker appearance="light" portal={false} />
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-100">
        <p className="mb-3 text-sm font-medium text-slate-300">Dark appearance</p>
        <DatePicker appearance="dark" portal={false} />
      </div>
    </div>
  ),
}
