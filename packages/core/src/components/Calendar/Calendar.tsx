
import React from 'react'
import { useCalendar } from '../../headless/useCalendar'
import { format } from 'date-fns'

export type CalendarProps = {
  selectedDate?: Date | null
  selectDate?: (date: Date) => void
}

export default function Calendar({
  selectedDate: controlledSelectedDate,
  selectDate: controlledSelectDate
}: CalendarProps) {
  const normalizedSelected =
    controlledSelectedDate instanceof Date && !Number.isNaN(controlledSelectedDate.getTime())
      ? controlledSelectedDate
      : null

  const cal = useCalendar(normalizedSelected ?? undefined)
  const selectedDate = normalizedSelected ?? cal.selectedDate
  const selectDate = controlledSelectDate ?? cal.selectDate

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
            const isActive = selectedDate && cal.isSameDay(day, selectedDate)

            const handleClick = () => {
              selectDate(day)
            }

            return (
              <button
                key={wi + '-' + di}
                onClick={handleClick}
                className={
                  'rounded p-1 ' +
                  (isActive ? 'bg-blue-600 text-white ' : '') +
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
