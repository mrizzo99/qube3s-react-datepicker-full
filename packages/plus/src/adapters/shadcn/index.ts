import Calendar from './ShadcnCalendar'
import DatePicker from './ShadcnDatePicker'
import DateRangePicker from './ShadcnDateRangePicker'
import RangeCalendar from './ShadcnRangeCalendar'

export const shadcn = {
  Calendar,
  DatePicker,
  DateRangePicker,
  RangeCalendar,
} as const

export type ShadcnAdapter = typeof shadcn

export type { ShadcnCalendarProps } from './ShadcnCalendar'
export type { ShadcnDatePickerProps } from './ShadcnDatePicker'
export type { ShadcnDateRangePickerProps } from './ShadcnDateRangePicker'
export type { ShadcnRangeCalendarProps } from './ShadcnRangeCalendar'
