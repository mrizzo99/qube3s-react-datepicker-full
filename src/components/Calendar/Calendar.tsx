
import React from 'react'
import { useCalendar, type DateRange } from '../../headless/useCalendar'
import { format } from 'date-fns'

type CalendarProps = {
  selectedDate?: Date | null
  selectDate?: (date: Date) => void
  selectedRange?: DateRange | null
  selectRange?: (range: DateRange) => void
  mode?: 'single' | 'range'
}

const normalizeDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  return null
}

const normalizeRange = (value: DateRange | null | undefined): DateRange | null => {
  if (!value) return null
  const start = normalizeDate(value.start)
  const end = normalizeDate(value.end)
  if (start && end && end.getTime() < start.getTime()) return { start: end, end: start }
  return { start, end }
}

export default function Calendar({
  selectedDate: controlledSelectedDate,
  selectDate: controlledSelectDate,
  selectedRange: controlledSelectedRange,
  selectRange: controlledSelectRange,
  mode
}: CalendarProps) {
  const normalizedSelected =
    controlledSelectedDate instanceof Date && !Number.isNaN(controlledSelectedDate.getTime())
      ? controlledSelectedDate
      : null
  const normalizedRange = normalizeRange(controlledSelectedRange)

  const resolvedMode: 'single' | 'range' = mode ?? (normalizedRange || controlledSelectRange ? 'range' : 'single')

  const cal = useCalendar(resolvedMode === 'range' ? normalizedRange ?? undefined : normalizedSelected ?? undefined)
  const selectedDate = resolvedMode === 'range' ? null : normalizedSelected ?? cal.selectedDate
  const selectedRange = resolvedMode === 'range' ? normalizedRange ?? cal.selectedRange : null
  const selectDate = controlledSelectDate ?? cal.selectDate
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
            const isSingleSelected = selectedDate && cal.isSameDay(day, selectedDate)
            const isRangeEdge = selectedRange ? cal.isRangeEdge(day, selectedRange) : false
            const inRange = selectedRange ? cal.isInRange(day, selectedRange) : false
            const isActive = resolvedMode === 'range' ? isRangeEdge : isSingleSelected

            const handleClick = () => {
              if (resolvedMode === 'range') {
                const nextRange = cal.nextRange(day, selectedRange ?? cal.selectedRange)
                selectRange(nextRange)
              } else {
                selectDate(day)
              }
            }

            return (
              <button
                key={wi + '-' + di}
                onClick={handleClick}
                className={
                  'rounded p-1 ' +
                  (isActive ? 'bg-blue-600 text-white ' : inRange ? 'bg-blue-100 text-blue-800 ' : '') +
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
