import {
  createDatePicker,
  type DatePickerCalendarProps,
  type DatePickerDaySlotState,
  type DatePickerInputProps,
  type DatePickerSkin,
} from '@qube3s/react-datepicker-core/components/DatePicker/createDatePicker'
import {
  type PlusDatePickerProps as DatePickerProps,
  useResolvedPlusDatePickerProps,
} from './datePickerProps'

export type { PlusDatePickerProps as DatePickerProps } from './datePickerProps'
export type {
  DatePickerCalendarProps,
  DatePickerDaySlotState,
  DatePickerInputProps,
  DatePickerSkin,
}
const DatePicker = createDatePicker<DatePickerProps>(useResolvedPlusDatePickerProps)

export default DatePicker
