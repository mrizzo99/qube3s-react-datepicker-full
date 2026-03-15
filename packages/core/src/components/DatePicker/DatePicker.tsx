import {
  createDatePicker,
  type DatePickerBaseProps,
  type DatePickerCalendarProps,
  type DatePickerInputProps,
} from './createDatePicker'

export type DatePickerProps = DatePickerBaseProps
export type { DatePickerInputProps, DatePickerCalendarProps }

const useResolvedDatePickerProps = (props: DatePickerProps) => props

const DatePicker = createDatePicker<DatePickerProps>(useResolvedDatePickerProps)

export default DatePicker
