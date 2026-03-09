import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  addDays,
  addMonths,
  differenceInCalendarMonths,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { resolveCalendarI18n, type CalendarI18n } from '@core/i18n'
import { useRangeCalendar, type DateRange } from '../../headless/useRangeCalendar'

export type RangeCalendarProps = {
  selectedRange?: DateRange | null
  selectRange?: (range: DateRange) => void
  onEscape?: () => void
  i18n?: CalendarI18n
  numberOfMonths?: number
}

type MonthView = {
  monthStart: Date
  weeks: Date[][]
  weekdayLabels: string[]
}

const clampNumberOfMonths = (value: number | undefined) => {
  if (!value) return 1
  return Math.max(1, Math.min(3, Math.trunc(value)))
}

const buildMonthWeeks = (
  monthStart: Date,
  weekOptions: { locale: ReturnType<typeof resolveCalendarI18n>['locale']; weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 },
) => {
  const start = startOfWeek(startOfMonth(monthStart), weekOptions)
  const end = endOfWeek(endOfMonth(monthStart), weekOptions)
  const days: Date[] = []

  let pointer = start
  while (pointer <= end) {
    days.push(pointer)
    pointer = addDays(pointer, 1)
  }

  const weeks: Date[][] = []
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7))
  }

  return weeks
}

const getVisibleRangeDays = (
  monthStart: Date,
  numberOfMonths: number,
  weekOptions: { locale: ReturnType<typeof resolveCalendarI18n>['locale']; weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 },
) => {
  const firstDay = startOfWeek(startOfMonth(monthStart), weekOptions)
  const lastVisibleMonth = addMonths(monthStart, numberOfMonths - 1)
  const lastDay = endOfWeek(endOfMonth(lastVisibleMonth), weekOptions)
  const days: Date[] = []

  let pointer = firstDay
  while (pointer <= lastDay) {
    days.push(pointer)
    pointer = addDays(pointer, 1)
  }

  return days
}

export default function RangeCalendar({
  selectedRange: controlledSelectedRange,
  selectRange: controlledSelectRange,
  onEscape,
  i18n,
  numberOfMonths,
}: RangeCalendarProps) {
  const normalizedRange = controlledSelectedRange ?? null
  const resolvedI18n = useMemo(() => resolveCalendarI18n(i18n), [i18n])
  const formatOptions = useMemo(
    () => ({ locale: resolvedI18n.locale }),
    [resolvedI18n.locale],
  )
  const cal = useRangeCalendar(normalizedRange ?? undefined, {
    locale: resolvedI18n.locale,
    weekStartsOn: resolvedI18n.weekStartsOn,
  })
  const selectedRange = normalizedRange ?? cal.selectedRange
  const selectRange = controlledSelectRange ?? cal.selectRange
  const normalizedMonths = clampNumberOfMonths(numberOfMonths)
  const monthLabelId = useMemo(
    () => `range-cal-month-${cal.currentMonth.getFullYear()}-${cal.currentMonth.getMonth()}`,
    [cal.currentMonth],
  )

  const anchorDate = selectedRange?.start ?? selectedRange?.end ?? cal.currentMonth
  const [focusDate, setFocusDate] = useState<Date>(anchorDate)
  const gridRef = useRef<HTMLDivElement>(null)

  const weekOptions = useMemo(
    () => ({ locale: resolvedI18n.locale, weekStartsOn: resolvedI18n.weekStartsOn }),
    [resolvedI18n.locale, resolvedI18n.weekStartsOn],
  )

  const visibleMonths = useMemo(
    () =>
      Array.from({ length: normalizedMonths }, (_, index) => {
        const monthStart = startOfMonth(addMonths(cal.currentMonth, index))
        const weeks = buildMonthWeeks(monthStart, weekOptions)

        return {
          monthStart,
          weeks,
          weekdayLabels: (weeks[0] ?? []).map(day =>
            format(day, resolvedI18n.format.weekdayLabel, formatOptions),
          ),
        } satisfies MonthView
      }),
    [
      cal.currentMonth,
      normalizedMonths,
      weekOptions,
      resolvedI18n.format.weekdayLabel,
      formatOptions,
    ],
  )

  const visibleRangeDays = useMemo(
    () => getVisibleRangeDays(cal.currentMonth, normalizedMonths, weekOptions),
    [cal.currentMonth, normalizedMonths, weekOptions],
  )

  const monthAnimatorRef = useRef<HTMLDivElement>(null)
  const previousMonthRef = useRef(cal.currentMonth)

  useEffect(() => {
    const monthOffset = differenceInCalendarMonths(startOfMonth(focusDate), startOfMonth(cal.currentMonth))

    if (monthOffset < 0) {
      cal.goToMonth(startOfMonth(focusDate))
      return
    }

    if (monthOffset >= normalizedMonths) {
      cal.goToMonth(addMonths(startOfMonth(focusDate), -(normalizedMonths - 1)))
    }
  }, [focusDate, cal, normalizedMonths])

  useEffect(() => {
    const prev = previousMonthRef.current
    const next = cal.currentMonth
    const monthDelta = differenceInCalendarMonths(startOfMonth(next), startOfMonth(prev))

    if (monthDelta === 0 || !monthAnimatorRef.current || typeof monthAnimatorRef.current.animate !== 'function') {
      previousMonthRef.current = next
      return
    }

    monthAnimatorRef.current.animate(
      [
        { opacity: 0.88, transform: `translateX(${monthDelta > 0 ? '10px' : '-10px'})` },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      {
        duration: 180,
        easing: 'ease-out',
      },
    )

    previousMonthRef.current = next
  }, [cal.currentMonth])

  useEffect(() => {
    const focusMonthOffset = differenceInCalendarMonths(
      startOfMonth(focusDate),
      startOfMonth(cal.currentMonth),
    )
    const focusPanelIndex =
      focusMonthOffset < 0 ? 0 : Math.min(normalizedMonths - 1, focusMonthOffset)
    const focusPanelMonth = visibleMonths[focusPanelIndex]?.monthStart ?? visibleMonths[0]?.monthStart

    if (!focusPanelMonth) return

    const cell = gridRef.current?.querySelector<HTMLButtonElement>(
      `button[role="gridcell"][data-date-key="${focusDate.getTime()}-${focusPanelMonth.getTime()}"]`,
    )
    cell?.focus()
  }, [cal.currentMonth, focusDate, normalizedMonths, visibleMonths])

  const moveFocusByDays = (delta: number) => {
    setFocusDate(previous => addDays(previous, delta))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = visibleRangeDays.findIndex(day => cal.isSameDay(day, focusDate))
    const currentIndex = idx >= 0 ? idx : 0
    const rowStart = currentIndex - (currentIndex % 7)

    const setByIndex = (nextIndex: number) => {
      if (nextIndex < 0) {
        moveFocusByDays(nextIndex - currentIndex)
        return
      }

      if (nextIndex >= visibleRangeDays.length) {
        moveFocusByDays(nextIndex - currentIndex)
        return
      }

      setFocusDate(visibleRangeDays[nextIndex])
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
        setFocusDate(previous => addMonths(previous, event.shiftKey ? -12 : -1))
        break
      case 'PageDown':
        event.preventDefault()
        setFocusDate(previous => addMonths(previous, event.shiftKey ? 12 : 1))
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

  const headerLabel = useMemo(() => {
    if (visibleMonths.length === 1) {
      return format(visibleMonths[0].monthStart, resolvedI18n.format.monthLabel, formatOptions)
    }

    const first = format(visibleMonths[0].monthStart, resolvedI18n.format.monthLabel, formatOptions)
    const last = format(
      visibleMonths[visibleMonths.length - 1].monthStart,
      resolvedI18n.format.monthLabel,
      formatOptions,
    )

    return `${first} - ${last}`
  }, [visibleMonths, resolvedI18n.format.monthLabel, formatOptions])

  return (
    <div
      className="inline-block w-fit max-w-[calc(100vw-1rem)] rounded-lg border bg-white p-4 text-gray-900 shadow"
      role="grid"
      aria-labelledby={monthLabelId}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={gridRef}
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex gap-1">
          <button
            onClick={() => {
              cal.prevYear()
              setFocusDate(previous => addMonths(previous, -12))
            }}
            aria-label={resolvedI18n.labels.prevYear}
          >
            «
          </button>
          <button
            onClick={() => {
              cal.prev()
              setFocusDate(previous => addMonths(previous, -1))
            }}
            aria-label={resolvedI18n.labels.prevMonth}
          >
            ←
          </button>
        </div>
        <div id={monthLabelId} className="text-center text-sm font-semibold text-gray-900 sm:text-base">
          {headerLabel}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => {
              cal.next()
              setFocusDate(previous => addMonths(previous, 1))
            }}
            aria-label={resolvedI18n.labels.nextMonth}
          >
            →
          </button>
          <button
            onClick={() => {
              cal.nextYear()
              setFocusDate(previous => addMonths(previous, 12))
            }}
            aria-label={resolvedI18n.labels.nextYear}
          >
            »
          </button>
        </div>
      </header>

      <div ref={monthAnimatorRef} className="flex flex-col gap-4 sm:flex-row sm:gap-3">
        {visibleMonths.map(monthView => (
          <section
            key={monthView.monthStart.getTime()}
            className="w-72 rounded-md border border-gray-200 bg-gray-50/50 p-2 sm:w-64"
          >
            <div className="mb-1 text-center text-sm font-medium text-gray-700">
              {format(monthView.monthStart, resolvedI18n.format.monthLabel, formatOptions)}
            </div>
            <div className="mb-1 grid grid-cols-7 text-sm text-gray-600" aria-hidden="true">
              {monthView.weekdayLabels.map((label, index) => (
                <div key={`${monthView.monthStart.getTime()}-weekday-${index}`} className="text-center">
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthView.weeks.map((week, weekIndex) =>
                week.map((day, dayIndex) => {
                  const faded = !cal.isSameMonth(day, monthView.monthStart)
                  const isRangeEdge = !!(selectedRange && cal.isRangeEdge(day, selectedRange))
                  const inRange = selectedRange ? cal.isInRange(day, selectedRange) : false
                  const isFocused = cal.isSameDay(day, focusDate) && cal.isSameMonth(day, focusDate)

                  const handleClick = () => {
                    const nextRange = cal.nextRange(day, selectedRange ?? cal.selectedRange)
                    setFocusDate(day)
                    selectRange(nextRange)
                  }

                  return (
                    <button
                      key={`${monthView.monthStart.getTime()}-${weekIndex}-${dayIndex}`}
                      role="gridcell"
                      aria-selected={isRangeEdge}
                      aria-disabled={faded}
                      tabIndex={isFocused ? 0 : -1}
                      data-date-key={`${day.getTime()}-${monthView.monthStart.getTime()}`}
                      onClick={handleClick}
                      className={
                        'rounded border border-transparent p-1 text-gray-900 transition-colors duration-150 hover:border-blue-400 focus-visible:border-blue-500 focus-visible:outline-none ' +
                        (isRangeEdge
                          ? 'bg-blue-600 text-white '
                          : inRange
                            ? 'bg-blue-100 text-blue-800 '
                            : '') +
                        (faded ? 'text-gray-300 ' : 'hover:bg-blue-100 ')
                      }
                      aria-label={format(day, resolvedI18n.format.dayAriaLabel, formatOptions)}
                    >
                      {format(day, resolvedI18n.format.dayLabel, formatOptions)}
                    </button>
                  )
                }),
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
