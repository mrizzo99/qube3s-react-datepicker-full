import React, { useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { useRangeCalendar, type DateRange } from '../../headless/useRangeCalendar'

export type RangeCalendarProps = {
  selectedRange?: DateRange | null
  selectRange?: (range: DateRange) => void
  onEscape?: () => void
}

export default function RangeCalendar({
  selectedRange: controlledSelectedRange,
  selectRange: controlledSelectRange,
  onEscape
}: RangeCalendarProps) {
  const normalizedRange = controlledSelectedRange ?? null
  const cal = useRangeCalendar(normalizedRange ?? undefined)
  const selectedRange = normalizedRange ?? cal.selectedRange
  const selectRange = controlledSelectRange ?? cal.selectRange
  const monthLabelId = useMemo(
    () => `range-cal-month-${cal.currentMonth.getFullYear()}-${cal.currentMonth.getMonth()}`,
    [cal.currentMonth]
  )

  const anchorDate = selectedRange?.start ?? selectedRange?.end ?? cal.currentMonth
  const [focusDate, setFocusDate] = useState<Date>(anchorDate)
  const gridRef = useRef<HTMLDivElement>(null)
  const gridDays = useMemo(() => cal.weeks.flat(), [cal.weeks])

  const findGridDate = (date: Date) => gridDays.find(d => cal.isSameDay(d, date)) ?? gridDays[0]

  useEffect(() => {
    setFocusDate(prev => findGridDate(prev))
    const focusTarget = findGridDate(focusDate)
    const cell = gridRef.current?.querySelector<HTMLButtonElement>(
      `button[role="gridcell"][data-date="${focusTarget.getTime()}"]`
    )
    cell?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cal.currentMonth, gridDays])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = gridDays.findIndex(d => cal.isSameDay(d, focusDate))
    const currentIndex = idx >= 0 ? idx : 0
    const rowStart = currentIndex - (currentIndex % 7)

    const setByIndex = (newIndex: number) => {
      const clamped = Math.max(0, Math.min(gridDays.length - 1, newIndex))
      setFocusDate(gridDays[clamped])
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        setByIndex(currentIndex - 1)
        break
      case 'ArrowRight':
        event.preventDefault()
        setByIndex(currentIndex + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        setByIndex(currentIndex - 7)
        break
      case 'ArrowDown':
        event.preventDefault()
        setByIndex(currentIndex + 7)
        break
      case 'Home':
        event.preventDefault()
        setByIndex(rowStart)
        break
      case 'End':
        event.preventDefault()
        setByIndex(rowStart + 6)
        break
      case 'PageUp':
        event.preventDefault()
        cal.prev()
        setFocusDate(addMonths(focusDate, -1))
        break
      case 'PageDown':
        event.preventDefault()
        cal.next()
        setFocusDate(addMonths(focusDate, 1))
        break
      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        selectRange(cal.nextRange(focusDate, selectedRange ?? cal.selectedRange))
        break
      default:
        break
    }
  }

  return (
    <div
      className="p-4 border rounded-lg shadow bg-white w-72"
      role="grid"
      aria-labelledby={monthLabelId}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={gridRef}
    >
      <header className="flex justify-between mb-2">
        <button onClick={cal.prev}>←</button>
        <div id={monthLabelId}>{format(cal.currentMonth, 'MMMM yyyy')}</div>
        <button onClick={cal.next}>→</button>
      </header>

      <div className="grid grid-cols-7 text-gray-500 text-sm mb-1" aria-hidden="true">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-center">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cal.weeks.map((week, wi) =>
          week.map((day, di) => {
            const faded = !cal.isSameMonth(day, cal.currentMonth)
            const isRangeEdge = selectedRange ? cal.isRangeEdge(day, selectedRange) : false
            const inRange = selectedRange ? cal.isInRange(day, selectedRange) : false
            const isFocused = cal.isSameDay(day, focusDate)

            const handleClick = () => {
              const nextRange = cal.nextRange(day, selectedRange ?? cal.selectedRange)
              selectRange(nextRange)
            }

            return (
              <button
                key={wi + '-' + di}
                role="gridcell"
                aria-selected={isRangeEdge}
                aria-disabled={faded}
                tabIndex={isFocused ? 0 : -1}
                data-date={day.getTime()}
                onClick={handleClick}
                className={
                  'rounded p-1 border border-transparent hover:border-blue-400 focus-visible:border-blue-500 focus-visible:outline-none ' +
                  (isRangeEdge ? 'bg-blue-600 text-white ' : inRange ? 'bg-blue-100 text-blue-800 ' : '') +
                  (faded ? 'text-gray-300 ' : 'hover:bg-blue-100 ')
                }
                aria-label={format(day, 'EEEE, MMMM d, yyyy')}
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
