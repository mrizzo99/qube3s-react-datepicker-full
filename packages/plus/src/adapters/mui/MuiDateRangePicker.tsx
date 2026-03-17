import React from 'react'
import {
  createDateRangePicker,
  type DateRangePickerCalendarProps,
  type DateRangePickerInputProps,
  type DateRangePickerProps,
  type DateRangePickerTheme,
} from '../../components/DateRangePicker/DateRangePicker'
import {
  muiActionButtonClassName,
  muiCalendarIcon,
  muiChevronLeftIcon,
  muiChevronRightIcon,
  muiChipClassName,
  muiClockIcon,
  muiDayButtonBaseClassName,
  muiElevationClassName,
  muiIconButtonClassName,
  muiOutlinedInputRootClassName,
  muiSurfaceClassName,
} from './shared'

const muiDateRangePickerTheme: DateRangePickerTheme = {
  rootClassName: 'relative inline-flex flex-col gap-3 text-sm',
  inputLayoutClassName: 'flex flex-wrap items-end gap-3',
  inputFieldsGroupClassName: 'flex flex-wrap gap-3',
  inputFieldClassName: 'MuiFormControl-root flex flex-col gap-1.5',
  inputLabelClassName:
    'MuiInputLabel-root text-[0.75rem] font-medium uppercase tracking-[0.06em] text-[color:var(--mui-palette-text-secondary,rgba(0,0,0,0.6))]',
  inputGroupClassName: muiOutlinedInputRootClassName,
  inputClassName:
    'MuiInputBase-input min-w-[220px] border-0 bg-transparent px-0 py-[16.5px] text-[0.875rem] leading-[1.4375em] text-[color:var(--mui-palette-text-primary,rgba(0,0,0,0.87))] placeholder:text-[color:var(--mui-palette-text-secondary,rgba(0,0,0,0.6))] focus:outline-none',
  triggerClassName: muiIconButtonClassName,
  validationMessageClassName: 'MuiFormHelperText-root text-[0.75rem] leading-[1.66]',
  validationMessageInvalidClassName: 'text-[color:var(--mui-palette-error-main,#d32f2f)]',
  validationMessageValidatingClassName: 'text-[color:var(--mui-palette-text-secondary,rgba(0,0,0,0.6))]',
  mobileBackdropClassName: 'MuiBackdrop-root absolute inset-0 bg-black/50 transition-opacity duration-200',
  mobileSheetClassName: [
    'MuiPaper-root relative max-h-[90vh] w-full overflow-y-auto rounded-t-[28px] p-4',
    muiSurfaceClassName,
    muiElevationClassName,
  ].join(' '),
  mobileSheetHandleClassName:
    'h-1.5 w-12 rounded-full bg-[var(--mui-palette-action-disabledBackground,rgba(0,0,0,0.12))]',
  desktopPopoverShellClassName: 'MuiPopover-root',
  desktopPopoverPanelClassName: [
    'MuiPaper-root max-w-[calc(100vw-1rem)] rounded-3xl p-4',
    muiSurfaceClassName,
    muiElevationClassName,
  ].join(' '),
  headerClassName: 'MuiPickersCalendarHeader-root mb-3 flex items-center justify-between gap-3',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName: muiIconButtonClassName,
  monthLabelClassName:
    'MuiTypography-root MuiTypography-subtitle1 text-center text-[0.95rem] font-medium leading-6 text-[color:var(--mui-palette-text-primary,rgba(0,0,0,0.87))]',
  timeWheelTitleClassName:
    'MuiTypography-root MuiTypography-caption text-[0.75rem] font-medium uppercase tracking-[0.04em] text-[color:var(--mui-palette-text-secondary,rgba(0,0,0,0.6))]',
  timeWheelListClassName: disabled =>
    [
      'MuiPaper-root h-16 overflow-y-auto rounded-[var(--mui-shape-borderRadius,4px)] border p-1',
      disabled
        ? 'cursor-not-allowed border-[color:var(--mui-palette-divider,rgba(0,0,0,0.12))] bg-[var(--mui-palette-action-disabledBackground,rgba(0,0,0,0.12))]'
        : 'border-[color:var(--mui-palette-divider,rgba(0,0,0,0.12))] bg-[var(--mui-palette-background-paper,#fff)]',
    ].join(' '),
  timeWheelOptionClassName: ({ selected }) =>
    [
      'MuiButtonBase-root MuiListItemButton-root w-full rounded-[var(--mui-shape-borderRadius,4px)] px-2 py-1 text-left text-[0.875rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mui-palette-primary-main,#1976d2)]',
      selected
        ? 'bg-[var(--mui-palette-primary-main,#1976d2)] text-[color:var(--mui-palette-primary-contrastText,#fff)]'
        : 'text-[color:var(--mui-palette-text-primary,rgba(0,0,0,0.87))] hover:bg-[var(--mui-palette-action-hover,rgba(0,0,0,0.04))]',
    ].join(' '),
  timeBoundarySectionClassName: [
    'MuiPaper-root rounded-2xl p-3',
    muiSurfaceClassName,
  ].join(' '),
  timeBoundaryHeaderClassName:
    'mb-2 flex items-center gap-2 text-[0.875rem] font-medium text-[color:var(--mui-palette-text-primary,rgba(0,0,0,0.87))]',
  timeBoundaryIconWrapClassName:
    'inline-flex h-4 w-4 items-center justify-center overflow-hidden text-[color:var(--mui-palette-action-active,rgba(0,0,0,0.54))]',
  timeSectionClassName:
    'mt-3 border-t border-[color:var(--mui-palette-divider,rgba(0,0,0,0.12))] pt-3',
  timeSectionTitleClassName:
    'mb-2 text-[0.875rem] font-medium text-[color:var(--mui-palette-text-primary,rgba(0,0,0,0.87))]',
  presetButtonClassName: active =>
    [
      muiChipClassName,
      active
        ? 'MuiChip-filled border-[color:var(--mui-palette-primary-main,#1976d2)] bg-[var(--mui-palette-primary-main,#1976d2)] text-[color:var(--mui-palette-primary-contrastText,#fff)]'
        : 'MuiChip-outlined border-[color:var(--mui-palette-divider,rgba(0,0,0,0.23))] bg-transparent text-[color:var(--mui-palette-text-primary,rgba(0,0,0,0.87))] hover:bg-[var(--mui-palette-action-hover,rgba(0,0,0,0.04))]',
    ].join(' '),
  monthsViewportClassName: 'flex flex-col gap-4 md:flex-row md:gap-3',
  monthPanelClassName: [
    'MuiPaper-root w-[320px] rounded-3xl p-3',
    muiSurfaceClassName,
  ].join(' '),
  monthPanelTitleClassName:
    'mb-1 text-center text-[0.875rem] font-medium text-[color:var(--mui-palette-text-secondary,rgba(0,0,0,0.6))]',
  weekdayRowClassName:
    'MuiDayCalendar-weekDayContainer mb-2 grid grid-cols-7 gap-1 text-[0.75rem] text-[color:var(--mui-palette-text-secondary,rgba(0,0,0,0.6))]',
  weekdayCellClassName:
    'MuiTypography-root MuiTypography-caption flex h-8 items-center justify-center font-medium uppercase tracking-[0.04em]',
  weekRowsClassName: 'flex flex-col gap-1',
  weekRowClassName: 'grid grid-cols-7 gap-1',
  dayButtonClassName: ({ rangeEdge, inRange, faded, focused }) =>
    [
      muiDayButtonBaseClassName,
      rangeEdge
        ? 'Mui-selected bg-[var(--mui-palette-primary-main,#1976d2)] text-[color:var(--mui-palette-primary-contrastText,#fff)] hover:bg-[var(--mui-palette-primary-dark,#1565c0)]'
        : '',
      !rangeEdge && inRange
        ? 'bg-[var(--mui-palette-action-selected,rgba(25,118,210,0.08))] text-[color:var(--mui-palette-primary-dark,#1565c0)]'
        : '',
      faded ? 'text-[color:var(--mui-palette-text-disabled,rgba(0,0,0,0.38))]' : '',
      !rangeEdge && !inRange
        ? 'text-[color:var(--mui-palette-text-primary,rgba(0,0,0,0.87))] hover:bg-[var(--mui-palette-action-hover,rgba(0,0,0,0.04))]'
        : '',
      focused && !rangeEdge ? 'bg-[var(--mui-palette-action-focus,rgba(0,0,0,0.12))]' : '',
    ]
      .filter(Boolean)
      .join(' '),
  actionsClassName:
    'mt-3 flex justify-end gap-2 border-t border-[color:var(--mui-palette-divider,rgba(0,0,0,0.12))] pt-3',
  cancelButtonClassName: [
    muiActionButtonClassName,
    'border border-transparent bg-transparent text-[color:var(--mui-palette-primary-main,#1976d2)] hover:bg-[var(--mui-palette-action-hover,rgba(0,0,0,0.04))]',
  ].join(' '),
  confirmButtonClassName: [
    muiActionButtonClassName,
    'border border-[color:var(--mui-palette-primary-main,#1976d2)] bg-[var(--mui-palette-primary-main,#1976d2)] text-[color:var(--mui-palette-primary-contrastText,#fff)] hover:bg-[var(--mui-palette-primary-dark,#1565c0)]',
  ].join(' '),
  icons: {
    calendar: muiCalendarIcon,
    clock: muiClockIcon,
    prevYear: muiChevronLeftIcon,
    prevMonth: muiChevronLeftIcon,
    nextMonth: muiChevronRightIcon,
    nextYear: muiChevronRightIcon,
  },
}

export type MuiDateRangePickerProps = Omit<DateRangePickerProps, 'theme' | 'skin'>

const MuiDateRangePickerBase = createDateRangePicker(muiDateRangePickerTheme)

const MuiDateRangePicker = ((incomingProps: MuiDateRangePickerProps) => {
  const { theme: _theme, skin: _skin, ...props } = incomingProps as MuiDateRangePickerProps & {
    theme?: unknown
    skin?: unknown
  }

  return <MuiDateRangePickerBase {...props} />
}) as typeof MuiDateRangePickerBase

MuiDateRangePicker.Input = MuiDateRangePickerBase.Input
MuiDateRangePicker.Calendar = MuiDateRangePickerBase.Calendar
MuiDateRangePicker.CalendarHeader = MuiDateRangePickerBase.CalendarHeader
MuiDateRangePicker.CalendarGrid = MuiDateRangePickerBase.CalendarGrid

export default MuiDateRangePicker
export type { DateRangePickerInputProps, DateRangePickerCalendarProps }
