import { useMemo } from 'react'
import { isAfter, isBefore, isSameDay, isWeekend } from 'date-fns'
import type {
  DatePickerAsyncValidationProps,
  DatePickerBaseProps,
  DatePickerResolvedProps,
  DatePickerSkin,
  DatePickerStylingProps,
} from '@qube3s/react-datepicker-core/components/DatePicker/createDatePicker'

const normalizeDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  return null
}

export type PlusDatePickerProps = DatePickerBaseProps &
  DatePickerStylingProps &
  DatePickerAsyncValidationProps & {
  minDate?: Date
  maxDate?: Date
  blockWeekends?: boolean
}

export const useResolvedPlusDatePickerProps = (props: PlusDatePickerProps): DatePickerResolvedProps => {
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
