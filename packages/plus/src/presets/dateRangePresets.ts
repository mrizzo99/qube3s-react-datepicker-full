import {
  startOfDay,
  startOfQuarter,
  startOfYear,
  subDays,
} from 'date-fns'
import type { DateRange } from '../headless/useRangeCalendar'

export type DateRangePresetKey =
  | 'today'
  | 'last7Days'
  | 'last30Days'
  | 'thisQuarter'
  | 'yearToDate'

export type DateRangePreset = {
  key: DateRangePresetKey
  label: string
  range: DateRange
}

export const getDateRangePresets = (
  labels: Record<DateRangePresetKey, string>,
  baseDate: Date = new Date(),
): DateRangePreset[] => {
  const today = startOfDay(baseDate)

  return [
    {
      key: 'today',
      label: labels.today,
      range: { start: today, end: today },
    },
    {
      key: 'last7Days',
      label: labels.last7Days,
      range: { start: subDays(today, 6), end: today },
    },
    {
      key: 'last30Days',
      label: labels.last30Days,
      range: { start: subDays(today, 29), end: today },
    },
    {
      key: 'thisQuarter',
      label: labels.thisQuarter,
      range: { start: startOfQuarter(today), end: today },
    },
    {
      key: 'yearToDate',
      label: labels.yearToDate,
      range: { start: startOfYear(today), end: today },
    },
  ]
}
