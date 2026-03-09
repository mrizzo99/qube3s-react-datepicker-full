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
import { resolveCalendarI18n, type CalendarI18n } from '../../i18n'
import { useCalendar } from '../../headless/useCalendar'

type DatePickerContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedDate: Date | null
  selectDate: (date: Date) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  describedById: string
  formatted: string
  placeholderText: string
  formatDescriptionText: string
  resolvedI18n: ReturnType<typeof resolveCalendarI18n>
  formatOptions: { locale: ReturnType<typeof resolveCalendarI18n>['locale'] }
  cal: ReturnType<typeof useCalendar>
  focusDate: Date
  setFocusDate: React.Dispatch<React.SetStateAction<Date>>
  gridRef: React.RefObject<HTMLDivElement | null>
  monthLabelId: string
  onEscape: () => void
}

const DatePickerContext = createContext<DatePickerContextValue | null>(null)

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

export type DatePickerProps = {
  children?: React.ReactNode
  value?: Date | null
  onChange?: (date: Date) => void
  placeholder?: string
  formatDescription?: string
  i18n?: CalendarI18n
}

export type DatePickerInputProps = {
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  iconAriaLabel?: string
  inputClassName?: string
  triggerClassName?: string
  placeholder?: string
  formatDescription?: string
}

export type DatePickerCalendarProps = {
  children?: React.ReactNode
  className?: string
  popoverClassName?: string
}

function useDatePickerContext() {
  const context = useContext(DatePickerContext)
  if (!context) throw new Error('DatePicker compound components must be used inside <DatePicker>.')
  return context
}

function DatePickerRoot({
  children,
  value,
  onChange,
  placeholder,
  formatDescription,
  i18n,
}: DatePickerProps) {
  const resolvedI18n = useMemo(() => resolveCalendarI18n(i18n), [i18n])
  const formatOptions = useMemo(
    () => ({ locale: resolvedI18n.locale }),
    [resolvedI18n.locale],
  )
  const [open, setOpen] = useState(false)
  const [internalDate, setInternalDate] = useState<Date | null>(value ?? null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const describedById = useId()

  useEffect(() => {
    if (value !== undefined) setInternalDate(value ?? null)
  }, [value])

  const selectedDate = value ?? internalDate

  const cal = useCalendar(selectedDate ?? undefined, {
    locale: resolvedI18n.locale,
    weekStartsOn: resolvedI18n.weekStartsOn,
  })

  const monthLabelId = useMemo(
    () => `date-picker-month-${cal.currentMonth.getFullYear()}-${cal.currentMonth.getMonth()}`,
    [cal.currentMonth],
  )

  const activeDate = selectedDate ?? cal.currentMonth
  const [focusDate, setFocusDate] = useState<Date>(activeDate)

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

  const formatted = useMemo(
    () =>
      selectedDate
        ? format(selectedDate, resolvedI18n.format.inputValue, formatOptions)
        : '',
    [selectedDate, resolvedI18n.format.inputValue, formatOptions],
  )

  const placeholderText = placeholder ?? resolvedI18n.labels.selectDatePlaceholder
  const formatDescriptionText = formatDescription ?? resolvedI18n.labels.formatDescription

  const selectDate = (date: Date) => {
    if (value === undefined) setInternalDate(date)
    onChange?.(date)
    setOpen(false)
    inputRef.current?.focus()
  }

  const onEscape = () => {
    setOpen(false)
    inputRef.current?.focus()
  }

  const contextValue: DatePickerContextValue = {
    open,
    setOpen,
    selectedDate,
    selectDate,
    inputRef,
    containerRef,
    describedById,
    formatted,
    placeholderText,
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
    <DatePickerContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className="relative inline-flex items-center gap-1"
        style={open ? { zIndex: 'var(--rdp-z-popover, 1000)' } : undefined}
      >
        {children ?? (
          <>
            <DatePickerInput />
            <DatePickerCalendar>
              <DatePickerCalendarHeader />
              <DatePickerCalendarGrid />
            </DatePickerCalendar>
          </>
        )}
      </div>
    </DatePickerContext.Provider>
  )
}

function DatePickerInput({
  icon,
  iconPosition = 'right',
  iconAriaLabel = 'Open calendar',
  inputClassName = '',
  triggerClassName = '',
  placeholder,
  formatDescription,
}: DatePickerInputProps) {
  const {
    open,
    setOpen,
    inputRef,
    describedById,
    formatted,
    placeholderText,
    formatDescriptionText,
  } = useDatePickerContext()

  const resolvedPlaceholder = placeholder ?? placeholderText
  const resolvedFormatDescription = formatDescription ?? formatDescriptionText

  return (
    <>
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
        className={`w-48 rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-500 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${inputClassName}`}
        placeholder={resolvedPlaceholder}
        onClick={() => setOpen(current => !current)}
        value={formatted}
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
      <span id={describedById} style={visuallyHidden}>
        {resolvedFormatDescription}
      </span>
    </>
  )
}

function DatePickerCalendar({
  children,
  className = '',
  popoverClassName = '',
}: DatePickerCalendarProps) {
  const { open, resolvedI18n } = useDatePickerContext()

  if (!open) return null

  return (
    <div
      className={`absolute left-0 top-full mt-2 rounded bg-white shadow ${popoverClassName}`}
      style={{ zIndex: 'var(--rdp-z-popover, 1000)' }}
      role="dialog"
      aria-label={resolvedI18n.labels.calendar}
    >
      <div className={`w-72 rounded-lg border bg-white p-4 text-gray-900 shadow ${className}`}>
        {children ?? (
          <>
            <DatePickerCalendarHeader />
            <DatePickerCalendarGrid />
          </>
        )}
      </div>
    </div>
  )
}

function DatePickerCalendarHeader() {
  const { cal, resolvedI18n, formatOptions, monthLabelId } = useDatePickerContext()

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

function DatePickerCalendarGrid() {
  const {
    cal,
    selectedDate,
    selectDate,
    resolvedI18n,
    formatOptions,
    focusDate,
    setFocusDate,
    gridRef,
    monthLabelId,
    onEscape,
  } = useDatePickerContext()

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
        selectDate(focusDate)
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
            const isActive = selectedDate ? cal.isSameDay(day, selectedDate) : false
            const isFocused = cal.isSameDay(day, focusDate)

            return (
              <button
                key={wi + '-' + di}
                role="gridcell"
                aria-selected={isActive}
                aria-disabled={faded}
                tabIndex={isFocused ? 0 : -1}
                data-date={day.getTime()}
                onClick={() => selectDate(day)}
                className={
                  'rounded border border-transparent p-1 text-gray-900 hover:border-blue-400 focus-visible:border-blue-500 focus-visible:outline-none ' +
                  (isActive ? 'bg-blue-600 text-white ' : '') +
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

type DatePickerCompoundComponent = React.FC<DatePickerProps> & {
  Input: typeof DatePickerInput
  Calendar: typeof DatePickerCalendar
  CalendarHeader: typeof DatePickerCalendarHeader
  CalendarGrid: typeof DatePickerCalendarGrid
}

const DatePicker = DatePickerRoot as DatePickerCompoundComponent
DatePicker.Input = DatePickerInput
DatePicker.Calendar = DatePickerCalendar
DatePicker.CalendarHeader = DatePickerCalendarHeader
DatePicker.CalendarGrid = DatePickerCalendarGrid

export default DatePicker
