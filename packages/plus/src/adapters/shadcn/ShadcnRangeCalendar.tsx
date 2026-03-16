import {
  createRangeCalendar,
  type RangeCalendarProps as ShadcnRangeCalendarProps,
  type RangeCalendarTheme,
} from '../../components/RangeCalendar/RangeCalendar'
import { shadcnChevronLeftIcon, shadcnChevronRightIcon } from './shared'

const shadcnRangeCalendarTheme: RangeCalendarTheme = {
  containerClassName: 'inline-block w-fit max-w-[calc(100vw-1rem)] rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md',
  headerClassName: 'mb-3 flex items-center justify-between gap-3',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName:
    'inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  monthLabelClassName: 'text-center text-sm font-medium text-foreground',
  presetsSectionClassName: 'mb-3',
  presetButtonClassName: active =>
    [
      'rounded-md border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:text-sm',
      active
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
    ].join(' '),
  monthsViewportClassName: 'flex flex-col gap-4 md:flex-row md:gap-3',
  monthPanelClassName: 'w-72 rounded-md border border-border bg-muted/30 p-2 md:w-64',
  monthPanelTitleClassName: 'mb-1 text-center text-sm font-medium text-foreground',
  weekdayRowClassName: 'mb-1 grid grid-cols-7 text-sm text-muted-foreground',
  weekdayCellClassName: 'text-center',
  weekRowsClassName: 'flex flex-col gap-1',
  weekRowClassName: 'grid grid-cols-7 gap-1',
  dayButtonClassName: ({ rangeEdge, inRange, faded, focused }) =>
    [
      'rounded-md border border-transparent p-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      rangeEdge ? 'bg-primary text-primary-foreground' : '',
      !rangeEdge && inRange ? 'bg-accent text-accent-foreground' : '',
      faded ? 'text-muted-foreground opacity-70' : '',
      !rangeEdge && !inRange ? 'hover:bg-accent hover:text-accent-foreground' : '',
      focused && !rangeEdge ? 'ring-1 ring-ring' : '',
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

const ShadcnRangeCalendar = createRangeCalendar(shadcnRangeCalendarTheme)

export default ShadcnRangeCalendar
export type { ShadcnRangeCalendarProps }
