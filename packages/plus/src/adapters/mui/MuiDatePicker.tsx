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
  muiCalendarIcon,
  muiChevronLeftIcon,
  muiChevronRightIcon,
  muiDayButtonBaseClassName,
  muiElevationClassName,
  muiIconButtonClassName,
  muiOutlinedInputRootClassName,
  muiSurfaceClassName,
} from './shared'

const muiDatePickerTheme: DatePickerAdapterTheme = {
  rootClassName: 'relative inline-flex items-center gap-1 text-sm',
  inputLayoutClassName: 'inline-flex flex-wrap items-center gap-3',
  inputGroupClassName: muiOutlinedInputRootClassName,
  inputClassName:
    'MuiInputBase-input min-w-[220px] border-0 bg-transparent px-0 py-[16.5px] text-[0.875rem] leading-[1.4375em] text-[color:var(--mui-palette-text-primary,rgba(0,0,0,0.87))] placeholder:text-[color:var(--mui-palette-text-secondary,rgba(0,0,0,0.6))] focus:outline-none',
  triggerClassName: muiIconButtonClassName,
  validationMessageClassName: 'MuiFormHelperText-root text-[0.75rem] leading-[1.66]',
  validationMessageInvalidClassName: 'text-[color:var(--mui-palette-error-main,#d32f2f)]',
  validationMessageValidatingClassName: 'text-[color:var(--mui-palette-text-secondary,rgba(0,0,0,0.6))]',
  popoverShellClassName: 'MuiPopover-root',
  popoverPanelClassName: [
    'MuiPaper-root MuiPopover-paper w-[328px] rounded-3xl p-4',
    muiSurfaceClassName,
    muiElevationClassName,
  ].join(' '),
  headerClassName: 'MuiPickersCalendarHeader-root mb-3 flex items-center justify-between gap-2',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName: muiIconButtonClassName,
  monthLabelClassName:
    'MuiTypography-root MuiTypography-subtitle1 text-[0.95rem] font-medium leading-6 text-[color:var(--mui-palette-text-primary,rgba(0,0,0,0.87))]',
  weekdayRowClassName:
    'MuiDayCalendar-weekDayContainer mb-2 grid grid-cols-7 gap-1 text-[0.75rem] text-[color:var(--mui-palette-text-secondary,rgba(0,0,0,0.6))]',
  weekdayCellClassName:
    'MuiTypography-root MuiTypography-caption flex h-8 items-center justify-center font-medium uppercase tracking-[0.04em]',
  gridClassName: 'MuiDayCalendar-monthView grid grid-cols-7 gap-1',
  dayButtonClassName: ({ active, disabled, faded, focused }) =>
    [
      muiDayButtonBaseClassName,
      active
        ? 'Mui-selected bg-[var(--mui-palette-primary-main,#1976d2)] text-[color:var(--mui-palette-primary-contrastText,#fff)] hover:bg-[var(--mui-palette-primary-dark,#1565c0)]'
        : '',
      disabled
        ? 'Mui-disabled cursor-not-allowed text-[color:var(--mui-palette-text-disabled,rgba(0,0,0,0.38))]'
        : '',
      !active && !disabled
        ? 'text-[color:var(--mui-palette-text-primary,rgba(0,0,0,0.87))] hover:bg-[var(--mui-palette-action-hover,rgba(0,0,0,0.04))]'
        : '',
      !active && faded ? 'text-[color:var(--mui-palette-text-disabled,rgba(0,0,0,0.38))]' : '',
      focused && !active ? 'bg-[var(--mui-palette-action-focus,rgba(0,0,0,0.12))]' : '',
    ]
      .filter(Boolean)
      .join(' '),
  icons: {
    calendar: muiCalendarIcon,
    prevYear: muiChevronLeftIcon,
    prevMonth: muiChevronLeftIcon,
    nextMonth: muiChevronRightIcon,
    nextYear: muiChevronRightIcon,
  },
}

export type MuiDatePickerProps = Omit<PlusDatePickerProps, 'theme' | 'skin'>

const resolveMuiDatePickerProps = (props: MuiDatePickerProps) =>
  useResolvedPlusDatePickerProps(props)

const MuiDatePickerBase = createDatePicker<MuiDatePickerProps>(
  resolveMuiDatePickerProps,
  muiDatePickerTheme,
)

const MuiDatePicker = ((incomingProps: MuiDatePickerProps) => {
  const { theme: _theme, skin: _skin, ...props } = incomingProps as MuiDatePickerProps & {
    theme?: unknown
    skin?: unknown
  }

  return <MuiDatePickerBase {...props} />
}) as typeof MuiDatePickerBase

MuiDatePicker.Input = MuiDatePickerBase.Input
MuiDatePicker.Calendar = MuiDatePickerBase.Calendar
MuiDatePicker.CalendarHeader = MuiDatePickerBase.CalendarHeader
MuiDatePicker.CalendarGrid = MuiDatePickerBase.CalendarGrid

export default MuiDatePicker
export type { DatePickerInputProps, DatePickerCalendarProps }
