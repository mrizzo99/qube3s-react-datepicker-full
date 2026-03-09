import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { addMonths, format } from 'date-fns'
import { resolveCalendarI18n, type CalendarI18n } from '@core/i18n'
import { useRangeCalendar, type DateRange } from '../../headless/useRangeCalendar'

type DateRangePickerContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedRange: DateRange
  selectRange: (range: DateRange) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  describedById: string
  formattedStart: string
  formattedEnd: string
  placeholderStartText: string
  placeholderEndText: string
  formatDescriptionText: string
  resolvedI18n: ReturnType<typeof resolveCalendarI18n>
  formatOptions: { locale: ReturnType<typeof resolveCalendarI18n>['locale'] }
  cal: ReturnType<typeof useRangeCalendar>
  focusDate: Date
  setFocusDate: React.Dispatch<React.SetStateAction<Date>>
  gridRef: React.RefObject<HTMLDivElement | null>
  monthLabelId: string
  onEscape: () => void
}

const DateRangePickerContext = createContext<DateRangePickerContextValue | null>(null)

const emptyRange: DateRange = { start: null, end: null }
const visuallyHidden = {
  position: 'absolute' as const,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: 0,
} satisfies React.CSSProperties

export type DateRangePickerProps = {
  children?: React.ReactNode
  value?: DateRange | null
  onChange?: (range: DateRange) => void
  placeholderStart?: string
  placeholderEnd?: string
  formatDescription?: string
  i18n?: CalendarI18n
}

export type DateRangePickerInputProps = {
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  iconAriaLabel?: string
  inputClassName?: string
  triggerClassName?: string
  placeholderStart?: string
  placeholderEnd?: string
  formatDescription?: string
}

export type DateRangePickerCalendarProps = {
  children?: React.ReactNode
  className?: string
  popoverClassName?: string
}

function useDateRangePickerContext() {
  const context = useContext(DateRangePickerContext)
  if (!context) {
    throw new Error('DateRangePicker compound components must be used inside <DateRangePicker>.')
  }
  return context
}

function DateRangePickerRoot({
  children,
  value,
  onChange,
  placeholderStart,
  placeholderEnd,
  formatDescription,
  i18n,
}: DateRangePickerProps) {
  const resolvedI18n = useMemo(() => resolveCalendarI18n(i18n), [i18n])
  const formatOptions = useMemo(
    () => ({ locale: resolvedI18n.locale }),
    [resolvedI18n.locale],
  )
  const [open, setOpen] = useState(false)
  const [internalRange, setInternalRange] = useState<DateRange>(value ?? emptyRange)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const describedById = useId()

  useEffect(() => {
    if (value !== undefined) setInternalRange(value ?? emptyRange)
  }, [value])

  const selectedRange = value ?? internalRange

  const cal = useRangeCalendar(selectedRange, {
    locale: resolvedI18n.locale,
    weekStartsOn: resolvedI18n.weekStartsOn,
  })

  const monthLabelId = useMemo(
    () => `date-range-picker-month-${cal.currentMonth.getFullYear()}-${cal.currentMonth.getMonth()}`,
    [cal.currentMonth],
  )

  const anchorDate = selectedRange.start ?? selectedRange.end ?? cal.currentMonth
  const [focusDate, setFocusDate] = useState<Date>(anchorDate)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (containerRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [open])

  const formattedStart = useMemo(
    () =>
      selectedRange.start
        ? format(selectedRange.start, resolvedI18n.format.inputValue, formatOptions)
        : '',
    [selectedRange.start, resolvedI18n.format.inputValue, formatOptions],
  )

  const formattedEnd = useMemo(
    () =>
      selectedRange.end
        ? format(selectedRange.end, resolvedI18n.format.inputValue, formatOptions)
        : '',
    [selectedRange.end, resolvedI18n.format.inputValue, formatOptions],
  )

  const placeholderStartText = placeholderStart ?? resolvedI18n.labels.startDatePlaceholder
  const placeholderEndText = placeholderEnd ?? resolvedI18n.labels.endDatePlaceholder
  const formatDescriptionText = formatDescription ?? resolvedI18n.labels.formatDescription

  const selectRange = (range: DateRange) => {
    if (value === undefined) setInternalRange(range)
    onChange?.(range)
    if (range.start && range.end) {
      setOpen(false)
      inputRef.current?.focus()
    }
  }

  const onEscape = () => {
    setOpen(false)
    inputRef.current?.focus()
  }

  const contextValue: DateRangePickerContextValue = {
    open,
    setOpen,
    selectedRange,
    selectRange,
    inputRef,
    containerRef,
    describedById,
    formattedStart,
    formattedEnd,
    placeholderStartText,
    placeholderEndText,
    formatDescriptionText,
    resolvedI18n,
    formatOptions,
    cal,
    focusDate,
    setFocusDate,
    gridRef,
    monthLabelId,
    onEscape,
  }

  return (
    <DateRangePickerContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className="relative inline-flex flex-col gap-2"
        style={open ? { zIndex: 'var(--rdp-z-popover, 1000)' } : undefined}
      >
        {children ?? (
          <>
            <DateRangePickerInput />
            <DateRangePickerCalendar>
              <DateRangePickerCalendarHeader />
              <DateRangePickerCalendarGrid />
            </DateRangePickerCalendar>
          </>
        )}
      </div>
    </DateRangePickerContext.Provider>
  )
}

function DateRangePickerInput({
  icon,
  iconPosition = 'right',
  iconAriaLabel = 'Open calendar',
  inputClassName = '',
  triggerClassName = '',
  placeholderStart,
  placeholderEnd,
  formatDescription,
}: DateRangePickerInputProps) {
  const {
    open,
    setOpen,
    inputRef,
    describedById,
    formattedStart,
    formattedEnd,
    placeholderStartText,
    placeholderEndText,
    formatDescriptionText,
  } = useDateRangePickerContext()

  const resolvedPlaceholderStart = placeholderStart ?? placeholderStartText
  const resolvedPlaceholderEnd = placeholderEnd ?? placeholderEndText
  const resolvedFormatDescription = formatDescription ?? formatDescriptionText

  return (
    <>
      <div className="flex gap-2">
        <div className="inline-flex items-center gap-1">
          {iconPosition === 'left' && (
            <button
              type="button"
              onClick={() => setOpen(current => !current)}
              aria-label={iconAriaLabel}
              className={`inline-flex items-center justify-center rounded border border-gray-300 bg-white p-2 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${triggerClassName}`}
            >
              {icon ?? <DefaultCalendarIcon />}
            </button>
          )}
          <input
            readOnly
            className={`w-40 rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-500 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${inputClassName}`}
            placeholder={resolvedPlaceholderStart}
            onClick={() => setOpen(current => !current)}
            value={formattedStart}
            ref={inputRef}
            aria-haspopup="grid"
            aria-expanded={open}
            aria-describedby={describedById}
          />
          {iconPosition === 'right' && (
            <button
              type="button"
              onClick={() => setOpen(current => !current)}
              aria-label={iconAriaLabel}
              className={`inline-flex items-center justify-center rounded border border-gray-300 bg-white p-2 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${triggerClassName}`}
            >
              {icon ?? <DefaultCalendarIcon />}
            </button>
          )}
        </div>

        <div className="inline-flex items-center gap-1">
          {iconPosition === 'left' && (
            <button
              type="button"
              onClick={() => setOpen(current => !current)}
              aria-label={iconAriaLabel}
              className={`inline-flex items-center justify-center rounded border border-gray-300 bg-white p-2 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${triggerClassName}`}
            >
              {icon ?? <DefaultCalendarIcon />}
            </button>
          )}
          <input
            readOnly
            className={`w-40 rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-500 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${inputClassName}`}
            placeholder={resolvedPlaceholderEnd}
            onClick={() => setOpen(current => !current)}
            value={formattedEnd}
            aria-describedby={describedById}
          />
          {iconPosition === 'right' && (
            <button
              type="button"
              onClick={() => setOpen(current => !current)}
              aria-label={iconAriaLabel}
              className={`inline-flex items-center justify-center rounded border border-gray-300 bg-white p-2 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${triggerClassName}`}
            >
              {icon ?? <DefaultCalendarIcon />}
            </button>
          )}
        </div>
      </div>

      <span id={describedById} style={visuallyHidden}>
        {resolvedFormatDescription}
      </span>
    </>
  )
}

function DateRangePickerCalendar({
  children,
  className = '',
  popoverClassName = '',
}: DateRangePickerCalendarProps) {
  const { open, resolvedI18n } = useDateRangePickerContext()

  if (!open) return null

  return (
    <div
      className={`absolute left-0 top-full mt-2 rounded bg-white shadow ${popoverClassName}`}
      style={{ zIndex: 'var(--rdp-z-popover, 1000)' }}
      role="dialog"
      aria-label={resolvedI18n.labels.rangeCalendar}
    >
      <div className={`w-72 rounded-lg border bg-white p-4 text-gray-900 shadow ${className}`}>
        {children ?? (
          <>
            <DateRangePickerCalendarHeader />
            <DateRangePickerCalendarGrid />
          </>
        )}
      </div>
    </div>
  )
}

function DateRangePickerCalendarHeader() {
  const { cal, resolvedI18n, formatOptions, monthLabelId } = useDateRangePickerContext()

  return (
    <header className="mb-2 flex justify-between">
      <button onClick={cal.prev} aria-label={resolvedI18n.labels.prevMonth}>
        ←
      </button>
      <div id={monthLabelId} className="font-semibold text-gray-900">
        {format(cal.currentMonth, resolvedI18n.format.monthLabel, formatOptions)}
      </div>
      <button onClick={cal.next} aria-label={resolvedI18n.labels.nextMonth}>
        →
      </button>
    </header>
  )
}

function DateRangePickerCalendarGrid() {
  const {
    cal,
    selectedRange,
    selectRange,
    resolvedI18n,
    formatOptions,
    focusDate,
    setFocusDate,
    gridRef,
    monthLabelId,
    onEscape,
  } = useDateRangePickerContext()

  const gridDays = useMemo(() => cal.weeks.flat(), [cal.weeks])
  const weekdayLabels = useMemo(
    () =>
      (cal.weeks[0] ?? []).map(day =>
        format(day, resolvedI18n.format.weekdayLabel, formatOptions),
      ),
    [cal.weeks, resolvedI18n.format.weekdayLabel, formatOptions],
  )

  const findGridDate = (date: Date) => gridDays.find(d => cal.isSameDay(d, date)) ?? gridDays[0]

  useEffect(() => {
    setFocusDate(previous => findGridDate(previous))
    const focusTarget = findGridDate(focusDate)
    const cell = gridRef.current?.querySelector<HTMLButtonElement>(
      `button[role="gridcell"][data-date="${focusTarget.getTime()}"]`,
    )
    cell?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cal.currentMonth, gridDays])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = gridDays.findIndex(d => cal.isSameDay(d, focusDate))
    const currentIndex = idx >= 0 ? idx : 0
    const rowStart = currentIndex - (currentIndex % 7)

    const setByIndex = (newIndex: number) => {
      const clamped = Math.max(0, Math.min(gridDays.length - 1, newIndex))
      setFocusDate(gridDays[clamped])
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        setByIndex(currentIndex - 1)
        break
      case 'ArrowRight':
        event.preventDefault()
        setByIndex(currentIndex + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        setByIndex(currentIndex - 7)
        break
      case 'ArrowDown':
        event.preventDefault()
        setByIndex(currentIndex + 7)
        break
      case 'Home':
        event.preventDefault()
        setByIndex(rowStart)
        break
      case 'End':
        event.preventDefault()
        setByIndex(rowStart + 6)
        break
      case 'PageUp':
        event.preventDefault()
        cal.prev()
        setFocusDate(addMonths(focusDate, -1))
        break
      case 'PageDown':
        event.preventDefault()
        cal.next()
        setFocusDate(addMonths(focusDate, 1))
        break
      case 'Escape':
        event.preventDefault()
        onEscape()
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        selectRange(cal.nextRange(focusDate, selectedRange ?? cal.selectedRange))
        break
      default:
        break
    }
  }

  return (
    <div role="grid" tabIndex={0} aria-labelledby={monthLabelId} onKeyDown={handleKeyDown} ref={gridRef}>
      <div className="mb-1 grid grid-cols-7 text-sm text-gray-600" aria-hidden="true">
        {weekdayLabels.map((label, index) => (
          <div key={index} className="text-center">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cal.weeks.map((week, wi) =>
          week.map((day, di) => {
            const faded = !cal.isSameMonth(day, cal.currentMonth)
            const isRangeEdge = cal.isRangeEdge(day, selectedRange)
            const inRange = cal.isInRange(day, selectedRange)
            const isFocused = cal.isSameDay(day, focusDate)

            return (
              <button
                key={wi + '-' + di}
                role="gridcell"
                aria-selected={isRangeEdge}
                aria-disabled={faded}
                tabIndex={isFocused ? 0 : -1}
                data-date={day.getTime()}
                onClick={() => {
                  const nextRange = cal.nextRange(day, selectedRange)
                  selectRange(nextRange)
                }}
                className={
                  'rounded border border-transparent p-1 text-gray-900 hover:border-blue-400 focus-visible:border-blue-500 focus-visible:outline-none ' +
                  (isRangeEdge
                    ? 'bg-blue-600 text-white '
                    : inRange
                      ? 'bg-blue-100 text-blue-800 '
                      : '') +
                  (faded ? 'text-gray-300 ' : 'hover:bg-blue-100 ')
                }
                aria-label={format(day, resolvedI18n.format.dayAriaLabel, formatOptions)}
              >
                {format(day, resolvedI18n.format.dayLabel, formatOptions)}
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}

function DefaultCalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-gray-600"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

type DateRangePickerCompoundComponent = React.FC<DateRangePickerProps> & {
  Input: typeof DateRangePickerInput
  Calendar: typeof DateRangePickerCalendar
  CalendarHeader: typeof DateRangePickerCalendarHeader
  CalendarGrid: typeof DateRangePickerCalendarGrid
}

const DateRangePicker = DateRangePickerRoot as DateRangePickerCompoundComponent
DateRangePicker.Input = DateRangePickerInput
DateRangePicker.Calendar = DateRangePickerCalendar
DateRangePicker.CalendarHeader = DateRangePickerCalendarHeader
DateRangePicker.CalendarGrid = DateRangePickerCalendarGrid

export default DateRangePicker
