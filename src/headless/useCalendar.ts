
import { useEffect, useMemo, useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, isSameDay, isSameMonth
} from 'date-fns'

export type DateRange = {
  start: Date | null
  end: Date | null
}

type UseCalendarInitial = Date | DateRange | undefined

const normalizeDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  return null
}

const normalizeRange = (value: UseCalendarInitial): DateRange => {
  if (!value) return { start: null, end: null }
  if (value instanceof Date) {
    const date = normalizeDate(value)
    return { start: date, end: null }
  }
  const start = normalizeDate(value.start)
  const end = normalizeDate(value.end)

  if (start && end && end.getTime() < start.getTime()) {
    return { start: end, end: start }
  }

  return { start, end }
}

export function useCalendar(initial?: UseCalendarInitial) {
  const initialRange = useMemo(() => normalizeRange(initial), [initial])

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (initialRange.start) return initialRange.start
    if (initialRange.end) return initialRange.end
    return new Date()
  })
  const [selectedRange, setSelectedRange] = useState<DateRange>(initialRange)

  useEffect(() => {
    if (initialRange.start) {
      setCurrentMonth(initialRange.start)
      return
    }
    if (initialRange.end) {
      setCurrentMonth(initialRange.end)
    }
  }, [initialRange.start, initialRange.end])


  /**
   * Weeks is constructed using the React useMemo() hook 
   * {@link https://react.dev/reference/react/useMemo}
   * This memoizes the computed value of weeks and only
   * recomputes weeks when something changes.  Avoid
   * rebuilding the month grid on every render if currentMonth
   * has not changed.
  */
  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth))
    const end = endOfWeek(endOfMonth(currentMonth))
    const days: Date[] = []

    let pointer = start
    while (pointer <= end) {
      days.push(pointer)
      pointer = addDays(pointer, 1)
    }

    const grid: Date[][] = []
    for (let i = 0; i < days.length; i += 7) grid.push(days.slice(i, i + 7))

    return grid
  }, [currentMonth])

  const nextRange = (day: Date, range: DateRange = selectedRange): DateRange => {
    const dayDate = normalizeDate(day)
    if (!dayDate) return { start: null, end: null }

    const { start, end } = range
    if (!start || (start && end)) {
      return { start: dayDate, end: null }
    }

    if (dayDate.getTime() < start.getTime()) {
      return { start: dayDate, end: start }
    }

    return { start, end: dayDate }
  }

  const selectRange = (range: DateRange) => setSelectedRange(normalizeRange(range))
  const selectDate = (date: Date | null) => setSelectedRange({ start: normalizeDate(date), end: null })

  const isInRange = (day: Date, range: DateRange = selectedRange) => {
    const { start, end } = range
    if (!start || !end) return false
    const time = day.getTime()
    return time >= start.getTime() && time <= end.getTime()
  }

  const isRangeEdge = (day: Date, range: DateRange = selectedRange) => {
    const { start, end } = range
    return (start && isSameDay(day, start)) || (end && isSameDay(day, end))
  }

  return {
    currentMonth,
    weeks,
    selectedDate: selectedRange.start,
    selectedRange,
    selectDate,
    selectRange,
    nextRange,
    isInRange,
    isRangeEdge,
    prev: () => setCurrentMonth(addMonths(currentMonth, -1)),
    next: () => setCurrentMonth(addMonths(currentMonth, 1)),
    isSameDay,
    isSameMonth
  }
}
