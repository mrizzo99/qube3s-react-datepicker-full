import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { format } from 'date-fns'
import Calendar from '../components/Calendar'
import DatePicker from '../components/DatePicker'
import DateRangePicker from '../components/DateRangePicker'
import RangeCalendar from '../components/RangeCalendar'
import { fluentAnimationPack } from './animationPack'

const meta: Meta = {
  title: 'Plus/Presets/Fluent Animation Pack',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

export const Showcase: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(null)
    const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
      start: null,
      end: null,
    })
    const [pickerRange, setPickerRange] = useState<{ start: Date | null; end: Date | null }>({
      start: null,
      end: null,
    })

    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm text-slate-500">Plus `Calendar` with fluent motion skin.</p>
          <Calendar theme="light" skin={fluentAnimationPack.calendar} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm text-slate-500">Plus `DatePicker` with popover fade, scale, and micro-interactions.</p>
          <DatePicker value={date ?? undefined} onChange={setDate} theme="light" skin={fluentAnimationPack.datePicker}>
            <DatePicker.Input />
            <DatePicker.Calendar>
              <DatePicker.CalendarHeader />
              <DatePicker.CalendarGrid />
            </DatePicker.Calendar>
          </DatePicker>
          <p className="mt-3 text-sm text-slate-500">
            {date ? `Selected: ${format(date, 'PPP')}` : 'Open the picker to preview fluent transitions.'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm text-slate-500">Plus `RangeCalendar` with month slide animation and animated preset chips.</p>
          <div className="overflow-x-auto pb-1">
            <RangeCalendar
              selectedRange={range}
              selectRange={setRange}
              numberOfMonths={2}
              showPresets
              theme="material-light"
              skin={fluentAnimationPack.rangeCalendar}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm text-slate-500">Plus `DateRangePicker` with fluent popover and modal motion.</p>
          <DateRangePicker
            value={pickerRange}
            onChange={setPickerRange}
            numberOfMonths={2}
            showPresets
            theme="material-light"
            mobile={{ enabled: true, mode: 'always', gestures: { swipeMonth: true, swipeToClose: true } }}
            skin={fluentAnimationPack.dateRangePicker}
          >
            <DateRangePicker.Input />
            <DateRangePicker.Calendar>
              <DateRangePicker.CalendarHeader />
              <DateRangePicker.CalendarGrid />
            </DateRangePicker.Calendar>
          </DateRangePicker>
          <p className="mt-3 text-sm text-slate-500">
            {pickerRange.start ? `Start: ${format(pickerRange.start, 'PPP')}` : 'Start: —'}{' '}
            {pickerRange.end ? `End: ${format(pickerRange.end, 'PPP')}` : 'End: —'}
          </p>
        </div>
      </div>
    )
  },
}
