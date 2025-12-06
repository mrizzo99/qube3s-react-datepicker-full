import React from 'react'
import { format } from 'date-fns'
import { useRangeCalendar, type DateRange } from '../../headless/useRangeCalendar'

export type RangeCalendarProps = {
  selectedRange?: DateRange | null
  selectRange?: (range: DateRange) => void
}

export default function RangeCalendar({
  selectedRange: controlledSelectedRange,
  selectRange: controlledSelectRange
}: RangeCalendarProps) {
  const normalizedRange = controlledSelectedRange ?? null
  const cal = useRangeCalendar(normalizedRange ?? undefined)
  const selectedRange = normalizedRange ?? cal.selectedRange
  const selectRange = controlledSelectRange ?? cal.selectRange

  return (
    <div className="p-4 border rounded-lg shadow bg-white w-72">
      <header className="flex justify-between mb-2">
        <button onClick={cal.prev}>←</button>
        <div>{format(cal.currentMonth, 'MMMM yyyy')}</div>
        <button onClick={cal.next}>→</button>
      </header>

      <div className="grid grid-cols-7 text-gray-500 text-sm mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-center">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cal.weeks.map((week, wi) =>
          week.map((day, di) => {
            const faded = !cal.isSameMonth(day, cal.currentMonth)
            const isRangeEdge = selectedRange ? cal.isRangeEdge(day, selectedRange) : false
            const inRange = selectedRange ? cal.isInRange(day, selectedRange) : false

            const handleClick = () => {
              const nextRange = cal.nextRange(day, selectedRange ?? cal.selectedRange)
              selectRange(nextRange)
            }

            return (
              <button
                key={wi + '-' + di}
                onClick={handleClick}
                className={
                  'rounded p-1 ' +
                  (isRangeEdge ? 'bg-blue-600 text-white ' : inRange ? 'bg-blue-100 text-blue-800 ' : '') +
                  (faded ? 'text-gray-300 ' : 'hover:bg-blue-100 ')
                }
              >
                {format(day, 'd')}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
