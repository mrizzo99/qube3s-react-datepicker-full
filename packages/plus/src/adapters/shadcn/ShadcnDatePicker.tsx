import React from 'react'
import {
  createDatePicker,
  type DatePickerAdapterTheme,
  type DatePickerCalendarProps,
  type DatePickerInputProps,
} from '@qube3s/react-datepicker-core/components/DatePicker/createDatePicker'
import {
  type PlusDatePickerProps,
  useResolvedPlusDatePickerProps,
} from '../../components/DatePicker/datePickerProps'
import {
  shadcnCalendarIcon,
  shadcnChevronLeftIcon,
  shadcnChevronRightIcon,
} from './shared'

const shadcnDatePickerTheme: DatePickerAdapterTheme = {
  rootClassName: 'relative inline-flex items-center gap-1',
  inputLayoutClassName: 'inline-flex flex-wrap items-center gap-3',
  inputGroupClassName: 'inline-flex items-center gap-2',
  inputClassName:
    'h-10 w-[280px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  triggerClassName:
    'inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  validationMessageClassName: 'text-sm',
  validationMessageInvalidClassName: 'text-destructive',
  validationMessageValidatingClassName: 'text-muted-foreground',
  popoverShellClassName: 'rounded-md bg-popover text-popover-foreground shadow-md',
  popoverPanelClassName: 'w-[320px] rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md',
  headerClassName: 'mb-3 flex items-center justify-between gap-2',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName:
    'inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  monthLabelClassName: 'text-sm font-medium text-foreground',
  weekdayRowClassName: 'mb-2 grid grid-cols-7 text-xs text-muted-foreground',
  weekdayCellClassName: 'flex h-8 items-center justify-center font-normal',
  gridClassName: 'grid grid-cols-7 gap-1',
  dayButtonClassName: ({ active, disabled, faded, focused }) =>
    [
      'inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      active ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : '',
      disabled ? 'cursor-not-allowed text-muted-foreground opacity-50' : '',
      !active && !disabled ? 'hover:bg-accent hover:text-accent-foreground' : '',
      !active && faded ? 'text-muted-foreground opacity-70' : '',
      focused && !active ? 'bg-accent/50 text-accent-foreground' : '',
    ]
      .filter(Boolean)
      .join(' '),
  icons: {
    calendar: shadcnCalendarIcon,
    prevYear: shadcnChevronLeftIcon,
    prevMonth: shadcnChevronLeftIcon,
    nextMonth: shadcnChevronRightIcon,
    nextYear: shadcnChevronRightIcon,
  },
}

export type ShadcnDatePickerProps = Omit<PlusDatePickerProps, 'theme' | 'skin'>

const resolveShadcnDatePickerProps = (props: ShadcnDatePickerProps) =>
  useResolvedPlusDatePickerProps(props)

const ShadcnDatePickerBase = createDatePicker<ShadcnDatePickerProps>(
  resolveShadcnDatePickerProps,
  shadcnDatePickerTheme,
)

const ShadcnDatePicker = ((incomingProps: ShadcnDatePickerProps) => {
  const { theme: _theme, skin: _skin, ...props } = incomingProps as ShadcnDatePickerProps & {
    theme?: unknown
    skin?: unknown
  }

  return <ShadcnDatePickerBase {...props} />
}) as typeof ShadcnDatePickerBase

ShadcnDatePicker.Input = ShadcnDatePickerBase.Input
ShadcnDatePicker.Calendar = ShadcnDatePickerBase.Calendar
ShadcnDatePicker.CalendarHeader = ShadcnDatePickerBase.CalendarHeader
ShadcnDatePicker.CalendarGrid = ShadcnDatePickerBase.CalendarGrid

export default ShadcnDatePicker
export type { DatePickerInputProps, DatePickerCalendarProps }
