import React from 'react'
import {
  createRangeCalendar,
  type RangeCalendarProps,
  type RangeCalendarTheme,
} from '../../components/RangeCalendar/RangeCalendar'
import {
  muiChipClassName,
  muiChevronLeftIcon,
  muiChevronRightIcon,
  muiDayButtonBaseClassName,
  muiElevationClassName,
  muiIconButtonClassName,
  muiSurfaceClassName,
} from './shared'

const muiRangeCalendarTheme: RangeCalendarTheme = {
  containerClassName: [
    'MuiPaper-root MuiDateRangeCalendar-root inline-block w-fit max-w-[calc(100vw-1rem)] rounded-3xl p-4',
    muiSurfaceClassName,
    muiElevationClassName,
  ].join(' '),
  headerClassName: 'MuiPickersCalendarHeader-root mb-3 flex items-center justify-between gap-3',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName: muiIconButtonClassName,
  monthLabelClassName:
    'MuiTypography-root MuiTypography-subtitle1 text-center text-[0.95rem] font-medium leading-6 text-[color:var(--mui-palette-text-primary,rgba(0,0,0,0.87))]',
  presetsSectionClassName: 'mb-3',
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
  icons: {
    prevYear: muiChevronLeftIcon,
    prevMonth: muiChevronLeftIcon,
    nextMonth: muiChevronRightIcon,
    nextYear: muiChevronRightIcon,
  },
}

export type MuiRangeCalendarProps = Omit<RangeCalendarProps, 'theme' | 'skin'>

const MuiRangeCalendarBase = createRangeCalendar(muiRangeCalendarTheme)

const MuiRangeCalendar = (incomingProps: MuiRangeCalendarProps) => {
  const { theme: _theme, skin: _skin, ...props } = incomingProps as MuiRangeCalendarProps & {
    theme?: unknown
    skin?: unknown
  }

  return <MuiRangeCalendarBase {...props} />
}

export default MuiRangeCalendar
