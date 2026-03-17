import React from 'react'
import {
  createCalendar,
  type CalendarProps,
  type CalendarTheme,
} from '@qube3s/react-datepicker-core/components/Calendar/Calendar'
import {
  muiChevronLeftIcon,
  muiChevronRightIcon,
  muiDayButtonBaseClassName,
  muiElevationClassName,
  muiIconButtonClassName,
  muiSurfaceClassName,
} from './shared'

const muiCalendarTheme: CalendarTheme = {
  containerClassName: [
    'MuiPaper-root MuiDateCalendar-root w-72 rounded-3xl p-4',
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
  dayButtonClassName: ({ active, faded, focused }) =>
    [
      muiDayButtonBaseClassName,
      active
        ? 'Mui-selected bg-[var(--mui-palette-primary-main,#1976d2)] text-[color:var(--mui-palette-primary-contrastText,#fff)] hover:bg-[var(--mui-palette-primary-dark,#1565c0)]'
        : '',
      !active
        ? 'text-[color:var(--mui-palette-text-primary,rgba(0,0,0,0.87))] hover:bg-[var(--mui-palette-action-hover,rgba(0,0,0,0.04))]'
        : '',
      faded ? 'text-[color:var(--mui-palette-text-disabled,rgba(0,0,0,0.38))]' : '',
      focused && !active ? 'bg-[var(--mui-palette-action-focus,rgba(0,0,0,0.12))]' : '',
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

export type MuiCalendarProps = Omit<CalendarProps, 'theme' | 'skin'>

const MuiCalendarBase = createCalendar(muiCalendarTheme)

const MuiCalendar = (incomingProps: MuiCalendarProps) => {
  const { theme: _theme, skin: _skin, ...props } = incomingProps as MuiCalendarProps & {
    theme?: unknown
    skin?: unknown
  }

  return <MuiCalendarBase {...props} />
}

export default MuiCalendar
