import {
  createDateRangePicker,
  type DateRangePickerCalendarProps,
  type DateRangePickerInputProps,
  type DateRangePickerProps as ShadcnDateRangePickerProps,
  type DateRangePickerTheme,
} from '../../components/DateRangePicker/DateRangePicker'
import {
  shadcnCalendarIcon,
  shadcnChevronLeftIcon,
  shadcnChevronRightIcon,
  shadcnClockIcon,
} from './shared'

const shadcnDateRangePickerTheme: DateRangePickerTheme = {
  rootClassName: 'relative inline-flex flex-col gap-3',
  inputLayoutClassName: 'flex flex-wrap items-end gap-3',
  inputFieldsGroupClassName: 'flex flex-wrap gap-3',
  inputFieldClassName: 'flex flex-col gap-1.5',
  inputLabelClassName: 'text-sm font-medium text-foreground',
  inputGroupClassName: 'inline-flex items-center gap-2',
  inputClassName:
    'rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  triggerClassName:
    'inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  validationMessageClassName: 'text-sm',
  validationMessageInvalidClassName: 'text-destructive',
  validationMessageValidatingClassName: 'text-muted-foreground',
  mobileBackdropClassName: 'absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200',
  mobileSheetClassName:
    'relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-popover p-4 text-popover-foreground shadow-lg',
  mobileSheetHandleClassName: 'h-1.5 w-12 rounded-full bg-muted',
  desktopPopoverShellClassName: 'rounded-md bg-popover text-popover-foreground shadow-md',
  desktopPopoverPanelClassName: 'max-w-[calc(100vw-1rem)] rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md',
  headerClassName: 'mb-3 flex items-center justify-between gap-3',
  headerNavGroupClassName: 'flex items-center gap-1',
  headerNavButtonClassName:
    'inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  monthLabelClassName: 'text-center text-sm font-medium text-foreground',
  timeWheelTitleClassName: 'text-xs font-medium text-muted-foreground',
  timeWheelListClassName: disabled =>
    disabled
      ? 'h-16 overflow-y-auto rounded-md border border-border bg-muted p-1 cursor-not-allowed'
      : 'h-16 overflow-y-auto rounded-md border border-border bg-background p-1',
  timeWheelOptionClassName: ({ selected }) =>
    [
      'w-full rounded-sm px-2 py-1 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      selected ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent hover:text-accent-foreground',
    ].join(' '),
  timeBoundarySectionClassName: 'rounded-md border border-border bg-muted/40 p-3',
  timeBoundaryHeaderClassName: 'mb-2 flex items-center gap-2 text-sm font-medium text-foreground',
  timeBoundaryIconWrapClassName: 'inline-flex h-4 w-4 items-center justify-center overflow-hidden text-muted-foreground',
  timeSectionClassName: 'mt-2 border-t border-border pt-3',
  timeSectionTitleClassName: 'mb-2 text-sm font-semibold text-foreground',
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
  actionsClassName: 'mt-3 flex justify-end gap-2 border-t border-border pt-3',
  cancelButtonClassName:
    'rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  confirmButtonClassName:
    'rounded-md border border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  icons: {
    calendar: shadcnCalendarIcon,
    clock: shadcnClockIcon,
    prevYear: shadcnChevronLeftIcon,
    prevMonth: shadcnChevronLeftIcon,
    nextMonth: shadcnChevronRightIcon,
    nextYear: shadcnChevronRightIcon,
  },
}

const ShadcnDateRangePicker = createDateRangePicker(shadcnDateRangePickerTheme)

export default ShadcnDateRangePicker
export type { ShadcnDateRangePickerProps, DateRangePickerInputProps, DateRangePickerCalendarProps }
