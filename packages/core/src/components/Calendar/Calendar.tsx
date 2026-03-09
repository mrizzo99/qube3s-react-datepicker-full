
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useCalendar } from '../../headless/useCalendar'
import { addMonths, format } from 'date-fns'
import { resolveCalendarI18n, type CalendarI18n } from '../../i18n'

export type CalendarProps = {
  selectedDate?: Date | null
  selectDate?: (date: Date) => void
  onEscape?: () => void
  i18n?: CalendarI18n
}

export default function Calendar({
  selectedDate: controlledSelectedDate,
  selectDate: controlledSelectDate,
  onEscape,
  i18n
}: CalendarProps) {
  const normalizedSelected =
    controlledSelectedDate instanceof Date && !Number.isNaN(controlledSelectedDate.getTime())
      ? controlledSelectedDate
      : null

  const resolvedI18n = useMemo(() => resolveCalendarI18n(i18n), [i18n])
  const formatOptions = useMemo(
    () => ({ locale: resolvedI18n.locale }),
    [resolvedI18n.locale]
  )
  const cal = useCalendar(normalizedSelected ?? undefined, {
    locale: resolvedI18n.locale,
    weekStartsOn: resolvedI18n.weekStartsOn
  })
  const selectedDate = normalizedSelected ?? cal.selectedDate
  const selectDate = controlledSelectDate ?? cal.selectDate
  const monthLabelId = useMemo(
    () => `cal-month-${cal.currentMonth.getFullYear()}-${cal.currentMonth.getMonth()}`,
    [cal.currentMonth]
  )

  const activeDate = selectedDate ?? cal.currentMonth
  const [focusDate, setFocusDate] = useState<Date>(activeDate)
  const gridRef = useRef<HTMLDivElement>(null)
  const gridDays = useMemo(() => cal.weeks.flat(), [cal.weeks])
  const weekdayLabels = useMemo(
    () =>
      (cal.weeks[0] ?? []).map(day =>
        format(day, resolvedI18n.format.weekdayLabel, formatOptions)
      ),
    [cal.weeks, resolvedI18n.format.weekdayLabel, formatOptions]
  )

  const findGridDate = (date: Date) => gridDays.find(d => cal.isSameDay(d, date)) ?? gridDays[0]

  useEffect(() => {
    // Clamp focus to the visible grid and move DOM focus accordingly
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
        if (event.shiftKey) {
          cal.prevYear()
          setFocusDate(addMonths(focusDate, -12))
        } else {
          cal.prev()
          setFocusDate(addMonths(focusDate, -1))
        }
        break
      case 'PageDown':
        event.preventDefault()
        if (event.shiftKey) {
          cal.nextYear()
          setFocusDate(addMonths(focusDate, 12))
        } else {
          cal.next()
          setFocusDate(addMonths(focusDate, 1))
        }
        break
      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        selectDate(focusDate)
        break
      default:
        break
    }
  }

  return (
    <div
      className="w-72 rounded-lg border bg-white p-4 text-gray-900 shadow"
      role="grid"
      tabIndex={0}
      aria-labelledby={monthLabelId}
      onKeyDown={handleKeyDown}
      ref={gridRef}
    >
      <header className="mb-2 flex justify-between">
        <div className="flex gap-1">
          <button onClick={cal.prevYear} aria-label={resolvedI18n.labels.prevYear}>«</button>
          <button onClick={cal.prev} aria-label={resolvedI18n.labels.prevMonth}>←</button>
        </div>
        <div id={monthLabelId} className="font-semibold text-gray-900">
          {format(cal.currentMonth, resolvedI18n.format.monthLabel, formatOptions)}
        </div>
        <div className="flex gap-1">
          <button onClick={cal.next} aria-label={resolvedI18n.labels.nextMonth}>→</button>
          <button onClick={cal.nextYear} aria-label={resolvedI18n.labels.nextYear}>»</button>
        </div>
      </header>

      <div className="mb-1 grid grid-cols-7 text-sm text-gray-600" aria-hidden="true">
        {weekdayLabels.map((label, index) => (
          <div key={index} className="text-center">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cal.weeks.map((week, wi) =>
          week.map((day, di) => {
            const faded = !cal.isSameMonth(day, cal.currentMonth)
            const isActive = selectedDate && cal.isSameDay(day, selectedDate)
            const isFocused = cal.isSameDay(day, focusDate)

            const handleClick = () => {
              selectDate(day)
            }

            return (
              <button
                key={wi + '-' + di}
                role="gridcell"
                aria-selected={!!isActive}
                aria-disabled={faded}
                tabIndex={isFocused ? 0 : -1}
                data-date={day.getTime()}
                onClick={handleClick}
                className={
                  'rounded border border-transparent p-1 text-gray-900 hover:border-blue-400 focus-visible:border-blue-500 focus-visible:outline-none ' +
                  (isActive ? 'bg-blue-600 text-white ' : '') +
                  (faded ? 'text-gray-300 ' : 'hover:bg-blue-100 ')
                }
                aria-label={format(day, resolvedI18n.format.dayAriaLabel, formatOptions)}
              >
                {format(day, resolvedI18n.format.dayLabel, formatOptions)}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
