
import { useEffect, useMemo, useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, isSameDay, isSameMonth
} from 'date-fns'

export function useCalendar(initial?: Date) {
  const baseDate = useMemo(() => {
    if (initial instanceof Date && !Number.isNaN(initial.getTime())) return initial
    return new Date()
  }, [initial])
  const [currentMonth, setCurrentMonth] = useState(baseDate)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentMonth(baseDate)
  }, [baseDate])

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
