import { useMemo, useState } from 'react'
import { useCalendar } from '@core/headless/useCalendar'
import { isSameDay } from 'date-fns'

export type DateRange = {
  start: Date | null
  end: Date | null
}

type UseRangeInitial = Date | DateRange | undefined

const normalizeDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  return null
}

const normalizeRange = (value: UseRangeInitial): DateRange => {
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

export function useRangeCalendar(initial?: UseRangeInitial) {
  const initialRange = useMemo(() => normalizeRange(initial), [initial])
  const anchorDate = initialRange.start ?? initialRange.end

  const core = useCalendar(anchorDate ?? undefined)
  const [selectedRange, setSelectedRange] = useState<DateRange>(initialRange)

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
    currentMonth: core.currentMonth,
    weeks: core.weeks,
    selectedRange,
    selectRange,
    nextRange,
    isInRange,
    isRangeEdge,
    prev: core.prev,
    next: core.next,
    isSameDay: core.isSameDay,
    isSameMonth: core.isSameMonth
  }
}
