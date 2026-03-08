
import { useEffect, useMemo, useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, isSameDay, isSameMonth
} from 'date-fns'
import type { Locale } from 'date-fns'

export type UseCalendarInitial = Date | undefined
export type UseCalendarOptions = {
  locale?: Locale
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

const normalizeDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  return null
}

export function useCalendar(initial?: UseCalendarInitial, options: UseCalendarOptions = {}) {
  const baseDate = useMemo(() => {
    const normalized = normalizeDate(initial)
    return normalized ?? new Date()
  }, [initial])

  const { locale, weekStartsOn } = options
  const weekOptions = useMemo(
    () => ({ locale, weekStartsOn }),
    [locale, weekStartsOn]
  )

  const [currentMonth, setCurrentMonth] = useState(baseDate)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentMonth(baseDate)
  }, [baseDate])

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), weekOptions)
    const end = endOfWeek(endOfMonth(currentMonth), weekOptions)
    const days: Date[] = []

    let pointer = start
    while (pointer <= end) {
      days.push(pointer)
      pointer = addDays(pointer, 1)
    }

    const grid: Date[][] = []
    for (let i = 0; i < days.length; i += 7) grid.push(days.slice(i, i + 7))

    return grid
  }, [currentMonth, weekOptions])

  return {
    currentMonth,
    weeks,
    selectedDate,
    selectDate: setSelectedDate,
    prev: () => setCurrentMonth(addMonths(currentMonth, -1)),
    next: () => setCurrentMonth(addMonths(currentMonth, 1)),
    isSameDay,
    isSameMonth
  }
}
