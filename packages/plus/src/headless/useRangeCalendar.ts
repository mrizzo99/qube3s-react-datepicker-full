import { useMemo, useState } from 'react'
import { useCalendar, type UseCalendarOptions } from '@core/headless/useCalendar'
import { isAfter, isBefore, isSameDay } from 'date-fns'

export type DateRange = {
  start: Date | null
  end: Date | null
}

type UseRangeInitial = Date | DateRange | undefined
export type UseRangeCalendarOptions = UseCalendarOptions & {
  minDate?: Date
  maxDate?: Date
}

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

export function useRangeCalendar(initial?: UseRangeInitial, options: UseRangeCalendarOptions = {}) {
  const minDate = normalizeDate(options.minDate)
  const maxDate = normalizeDate(options.maxDate)
  const hasValidBounds = !(minDate && maxDate && isAfter(minDate, maxDate))
  const normalizedMinDate = hasValidBounds ? minDate : null
  const normalizedMaxDate = hasValidBounds ? maxDate : null
  const initialRange = useMemo(() => normalizeRange(initial), [initial])
  const anchorDate = initialRange.start ?? initialRange.end

  const core = useCalendar(anchorDate ?? undefined, options)
  const [selectedRange, setSelectedRange] = useState<DateRange>(initialRange)

  const isDateDisabled = (day: Date) => {
    const dayDate = normalizeDate(day)
    if (!dayDate) return true
    if (normalizedMinDate && isBefore(dayDate, normalizedMinDate) && !isSameDay(dayDate, normalizedMinDate)) {
      return true
    }
    if (normalizedMaxDate && isAfter(dayDate, normalizedMaxDate) && !isSameDay(dayDate, normalizedMaxDate)) {
      return true
    }
    return false
  }

  const isRangeSelectable = (range: DateRange) => {
    if (range.start && isDateDisabled(range.start)) return false
    if (range.end && isDateDisabled(range.end)) return false
    return true
  }

  const nextRange = (day: Date, range: DateRange = selectedRange): DateRange => {
    const dayDate = normalizeDate(day)
    if (!dayDate) return { start: null, end: null }
    if (isDateDisabled(dayDate)) return range

    const { start, end } = range
    if (!start || (start && end)) {
      return { start: dayDate, end: null }
    }

    if (dayDate.getTime() < start.getTime()) {
      return { start: dayDate, end: start }
    }

    return { start, end: dayDate }
  }

  const selectRange = (range: DateRange) => {
    const nextRange = normalizeRange(range)
    if (!isRangeSelectable(nextRange)) return
    setSelectedRange(nextRange)
  }

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
    goToMonth: core.goToMonth,
    prev: core.prev,
    next: core.next,
    prevYear: core.prevYear,
    nextYear: core.nextYear,
    isSameDay: core.isSameDay,
    isSameMonth: core.isSameMonth,
    isDateDisabled,
    isRangeSelectable,
  }
}
