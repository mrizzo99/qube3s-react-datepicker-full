import {
  createDatePicker,
  type DatePickerCalendarProps,
  type DatePickerInputProps,
} from '@core/components/DatePicker/createDatePicker'
import {
  type PlusDatePickerProps as DatePickerProps,
  useResolvedPlusDatePickerProps,
} from './datePickerProps'

export type { PlusDatePickerProps as DatePickerProps } from './datePickerProps'
export type { DatePickerInputProps, DatePickerCalendarProps }
const DatePicker = createDatePicker<DatePickerProps>(useResolvedPlusDatePickerProps)

export default DatePicker
