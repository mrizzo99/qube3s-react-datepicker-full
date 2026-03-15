import {
  createCalendar,
  type CalendarProps as ShadcnCalendarProps,
  type CalendarTheme,
} from '@core/components/Calendar/Calendar'
import {
  shadcnChevronLeftIcon,
  shadcnChevronRightIcon,
} from './shared'

const shadcnCalendarTheme: CalendarTheme = {
  containerClassName: 'w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md',
  headerClassName: 'mb-2 flex justify-between',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName:
    'inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  monthLabelClassName: 'text-sm font-medium text-foreground',
  weekdayRowClassName: 'mb-1 grid grid-cols-7 text-sm text-muted-foreground',
  weekdayCellClassName: 'text-center',
  gridClassName: 'grid grid-cols-7 gap-1',
  dayButtonClassName: ({ active, faded, focused }) =>
    [
      'rounded-md border border-transparent p-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      active ? 'bg-primary text-primary-foreground' : '',
      !active ? 'hover:bg-accent hover:text-accent-foreground' : '',
      faded ? 'text-muted-foreground opacity-70' : '',
      focused && !active ? 'ring-1 ring-ring' : '',
    ]
      .filter(Boolean)
      .join(' '),
  icons: {
    prevYear: shadcnChevronLeftIcon,
    prevMonth: shadcnChevronLeftIcon,
    nextMonth: shadcnChevronRightIcon,
    nextYear: shadcnChevronRightIcon,
  },
}

const ShadcnCalendar = createCalendar(shadcnCalendarTheme)

export default ShadcnCalendar
export type { ShadcnCalendarProps }
