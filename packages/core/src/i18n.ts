import type { Locale } from 'date-fns'

export type CalendarI18n = {
  locale?: Locale
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  format?: {
    monthLabel?: string
    weekdayLabel?: string
    dayLabel?: string
    dayAriaLabel?: string
    inputValue?: string
  }
  labels?: {
    prevYear?: string
    prevMonth?: string
    nextMonth?: string
    nextYear?: string
    calendar?: string
    rangeCalendar?: string
    selectDatePlaceholder?: string
    startDatePlaceholder?: string
    endDatePlaceholder?: string
    formatDescription?: string
  }
}

export type ResolvedCalendarI18n = {
  locale?: Locale
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  format: {
    monthLabel: string
    weekdayLabel: string
    dayLabel: string
    dayAriaLabel: string
    inputValue: string
  }
  labels: {
    prevYear: string
    prevMonth: string
    nextMonth: string
    nextYear: string
    calendar: string
    rangeCalendar: string
    selectDatePlaceholder: string
    startDatePlaceholder: string
    endDatePlaceholder: string
    formatDescription: string
  }
}

const defaultI18n: ResolvedCalendarI18n = {
  locale: undefined,
  weekStartsOn: undefined,
  format: {
    monthLabel: 'MMMM yyyy',
    weekdayLabel: 'EEEEEE',
    dayLabel: 'd',
    dayAriaLabel: 'EEEE, MMMM d, yyyy',
    inputValue: 'PPP'
  },
  labels: {
    prevYear: 'Previous year',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    nextYear: 'Next year',
    calendar: 'Calendar',
    rangeCalendar: 'Range calendar',
    selectDatePlaceholder: 'Select date',
    startDatePlaceholder: 'Start date',
    endDatePlaceholder: 'End date',
    formatDescription: 'Date format: MM/DD/YYYY'
  }
}

export function resolveCalendarI18n(i18n?: CalendarI18n): ResolvedCalendarI18n {
  return {
    locale: i18n?.locale ?? defaultI18n.locale,
    weekStartsOn: i18n?.weekStartsOn ?? defaultI18n.weekStartsOn,
    format: {
      ...defaultI18n.format,
      ...i18n?.format
    },
    labels: {
      ...defaultI18n.labels,
      ...i18n?.labels
    }
  }
}
