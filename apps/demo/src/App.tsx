import React, { useState } from 'react'
import DateInput from '@core/components/DateInput'
import Calendar from '@core/components/Calendar'
import { format } from 'date-fns'
import DateRangeInput from '@plus/components/DateRangeInput'
import RangeCalendar from '@plus/components/RangeCalendar'

export default function App() {
  const [inlineSelectedDate, setInlineSelectedDate] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({ 
    start: null, 
    end: null 
  })
  const [rangeInput, setRangeInput] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  })

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-xl mb-4">React Datepicker Starter</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Single date selection - (inline - Calendar component)</h2>
        <Calendar selectedDate={inlineSelectedDate} selectDate={setInlineSelectedDate} />
        <p className="text-gray-600">
          {inlineSelectedDate ? `Selected: ${format(inlineSelectedDate, 'PPP')}` : 'Choose a date'}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Single date (popover) - DateInput Component</h2>
        <DateInput value={selectedDate} onChange={setSelectedDate} />
        <p className="text-gray-600">
          {selectedDate ? `Selected: ${format(selectedDate, 'PPP')}` : 'Choose a date'}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Range selection (inline - RangeCalendar componet)</h2>
        <RangeCalendar selectedRange={range} selectRange={setRange} />
        <p className="text-gray-600">
          {range.start ? `Start: ${format(range.start, 'PPP')}` : 'Start: —'}{' '}
          {range.end ? `End: ${format(range.end, 'PPP')}` : 'End: —'}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Range selection (popover - DateRangeInput Component)</h2>
        <DateRangeInput value={rangeInput} onChange={setRangeInput} />
        <p className="text-gray-600">
          {rangeInput.start ? `Start: ${format(rangeInput.start, 'PPP')}` : 'Start: —'}{' '}
          {rangeInput.end ? `End: ${format(rangeInput.end, 'PPP')}` : 'End: —'}
        </p>
      </section>

    </div>
  )
}
