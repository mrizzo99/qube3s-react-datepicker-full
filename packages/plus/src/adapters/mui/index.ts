import Calendar from './MuiCalendar'
import DatePicker from './MuiDatePicker'
import DateRangePicker from './MuiDateRangePicker'
import RangeCalendar from './MuiRangeCalendar'

export const mui = {
  Calendar,
  DatePicker,
  DateRangePicker,
  RangeCalendar,
} as const

export type MuiAdapter = typeof mui

export type { MuiCalendarProps } from './MuiCalendar'
export type { MuiDatePickerProps } from './MuiDatePicker'
export type { MuiDateRangePickerProps } from './MuiDateRangePicker'
export type { MuiRangeCalendarProps } from './MuiRangeCalendar'
