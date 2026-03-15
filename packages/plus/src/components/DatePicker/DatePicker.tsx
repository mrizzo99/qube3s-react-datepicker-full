import { useMemo } from 'react'
import { isAfter, isBefore, isSameDay, isWeekend } from 'date-fns'
import {
  createDatePicker,
  type DatePickerBaseProps,
  type DatePickerCalendarProps,
  type DatePickerInputProps,
} from '@core/components/DatePicker/createDatePicker'

const normalizeDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  return null
}

export type DatePickerProps = DatePickerBaseProps & {
  minDate?: Date
  maxDate?: Date
  blockWeekends?: boolean
}

export type { DatePickerInputProps, DatePickerCalendarProps }

const useResolvedDatePickerProps = (props: DatePickerProps) => {
  const minDate = normalizeDate(props.minDate)
  const maxDate = normalizeDate(props.maxDate)
  const blockWeekends = props.blockWeekends ?? false
  const hasValidBounds = !(minDate && maxDate && isAfter(minDate, maxDate))
  const normalizedMinDate = hasValidBounds ? minDate : null
  const normalizedMaxDate = hasValidBounds ? maxDate : null
  const { minDate: _minDate, maxDate: _maxDate, blockWeekends: _blockWeekends, ...baseProps } = props

  const isDateDisabled = useMemo(
    () => (day: Date) => {
      const dayDate = normalizeDate(day)
      if (!dayDate) return true
      if (blockWeekends && isWeekend(dayDate)) return true
      if (normalizedMinDate && isBefore(dayDate, normalizedMinDate) && !isSameDay(dayDate, normalizedMinDate)) {
        return true
      }
      if (normalizedMaxDate && isAfter(dayDate, normalizedMaxDate) && !isSameDay(dayDate, normalizedMaxDate)) {
        return true
      }
      return false
    },
    [blockWeekends, normalizedMinDate, normalizedMaxDate],
  )

  return {
    ...baseProps,
    isDateDisabled,
  }
}

const DatePicker = createDatePicker<DatePickerProps>(useResolvedDatePickerProps)

export default DatePicker
