import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  addDays,
  addMonths,
  differenceInCalendarMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { resolveCalendarI18n, type CalendarI18n } from '@core/i18n'
import { useRangeCalendar, type DateRange } from '../../headless/useRangeCalendar'
import { getDateRangePresets, type DateRangePreset } from '../../presets/dateRangePresets'

type TimeParts = {
  hours: number
  minutes: number
}

type DateRangePickerContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedRange: DateRange
  selectRange: (range: DateRange) => void
  updateRangeTime: (boundary: 'start' | 'end', parts: TimeParts) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
  describedById: string
  formattedStart: string
  formattedEnd: string
  placeholderStartText: string
  placeholderEndText: string
  formatDescriptionText: string
  enableTime: boolean
  timeFormat: '12h' | '24h'
  minuteStep: number
  startDefaultTime: TimeParts
  endDefaultTime: TimeParts
  timeLabelIcon: React.ReactNode | null
  timeLabelIconClassName: string
  resolvedI18n: ReturnType<typeof resolveCalendarI18n>
  formatOptions: { locale: ReturnType<typeof resolveCalendarI18n>['locale'] }
  cal: ReturnType<typeof useRangeCalendar>
  focusDate: Date
  setFocusDate: React.Dispatch<React.SetStateAction<Date>>
  gridRef: React.RefObject<HTMLDivElement | null>
  popoverRef: React.RefObject<HTMLDivElement | null>
  monthLabelId: string
  numberOfMonths: number
  portal: boolean
  portalContainer: HTMLElement | null
  showPresets: boolean
  presetRanges: DateRangePreset[]
  applyPresetRange: (preset: DateRangePreset) => void
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

const POPOVER_VIEWPORT_PADDING = 16
const POPOVER_OFFSET = 8

const clampNumberOfMonths = (value: number | undefined) => {
  if (!value) return 1
  return Math.max(1, Math.min(3, Math.trunc(value)))
}

const normalizeIconNode = (icon: React.ReactNode, iconClassName = 'h-4 w-4 object-contain') => {
  if (!React.isValidElement(icon)) return icon
  const props = icon.props as { className?: string; ['aria-hidden']?: boolean }
  const className = `${iconClassName} ${props.className ?? ''}`.trim()
  return React.cloneElement(
    icon as React.ReactElement<{ className?: string; ['aria-hidden']?: boolean }>,
    {
      className,
      'aria-hidden': props['aria-hidden'] ?? true,
    },
  )
}

const renderPickerIcon = (icon?: React.ReactNode) => (
  <span className="inline-flex h-4 w-4 items-center justify-center overflow-hidden" aria-hidden="true">
    {icon ? normalizeIconNode(icon) : <DefaultCalendarIcon />}
  </span>
)

type MonthView = {
  monthStart: Date
  weeks: Date[][]
  weekdayLabels: string[]
}

const buildMonthWeeks = (
  monthStart: Date,
  weekOptions: { locale: ReturnType<typeof resolveCalendarI18n>['locale']; weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 },
) => {
  const start = startOfWeek(startOfMonth(monthStart), weekOptions)
  const end = endOfWeek(endOfMonth(monthStart), weekOptions)
  const days: Date[] = []

  let pointer = start
  while (pointer <= end) {
    days.push(pointer)
    pointer = addDays(pointer, 1)
  }

  const weeks: Date[][] = []
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7))
  }

  return weeks
}

const getVisibleRangeDays = (
  monthStart: Date,
  numberOfMonths: number,
  weekOptions: { locale: ReturnType<typeof resolveCalendarI18n>['locale']; weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 },
) => {
  const firstDay = startOfWeek(startOfMonth(monthStart), weekOptions)
  const lastVisibleMonth = addMonths(monthStart, numberOfMonths - 1)
  const lastDay = endOfWeek(endOfMonth(lastVisibleMonth), weekOptions)
  const days: Date[] = []

  let pointer = firstDay
  while (pointer <= lastDay) {
    days.push(pointer)
    pointer = addDays(pointer, 1)
  }

  return days
}

export type DateRangePickerProps = {
  children?: React.ReactNode
  value?: DateRange | null
  onChange?: (range: DateRange) => void
  placeholderStart?: string
  placeholderEnd?: string
  formatDescription?: string
  i18n?: CalendarI18n
  numberOfMonths?: number
  showPresets?: boolean
  enableTime?: boolean
  timeFormat?: '12h' | '24h'
  minuteStep?: number
  defaultStartTime?: string
  defaultEndTime?: string
  timeLabelIcon?: React.ReactNode
  timeLabelIconClassName?: string
  portal?: boolean
  portalContainer?: HTMLElement | null
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

const DEFAULT_START_TIME: TimeParts = { hours: 9, minutes: 0 }
const DEFAULT_END_TIME: TimeParts = { hours: 17, minutes: 0 }

const normalizeMinuteStep = (value: number | undefined) => {
  if (!value || Number.isNaN(value)) return 1
  return Math.max(1, Math.min(30, Math.trunc(value)))
}

const normalizeTimeParts = (parts: TimeParts, minuteStep: number): TimeParts => {
  const nextHours = Math.max(0, Math.min(23, Math.trunc(parts.hours)))
  const normalizedMinutes = Math.max(0, Math.min(59, Math.trunc(parts.minutes)))
  const snappedMinutes = Math.floor(normalizedMinutes / minuteStep) * minuteStep
  return {
    hours: nextHours,
    minutes: Math.max(0, Math.min(59, snappedMinutes)),
  }
}

const parseTimeParts = (value: string | undefined, fallback: TimeParts, minuteStep: number): TimeParts => {
  if (!value) return normalizeTimeParts(fallback, minuteStep)

  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/)
  if (!match) return normalizeTimeParts(fallback, minuteStep)

  const rawHours = Number(match[1])
  const rawMinutes = Number(match[2])
  const meridiem = match[3]?.toLowerCase()
  if (Number.isNaN(rawHours) || Number.isNaN(rawMinutes)) {
    return normalizeTimeParts(fallback, minuteStep)
  }

  if (meridiem) {
    if (rawHours < 1 || rawHours > 12) return normalizeTimeParts(fallback, minuteStep)
    const base = rawHours % 12
    const hours = meridiem === 'pm' ? base + 12 : base
    return normalizeTimeParts({ hours, minutes: rawMinutes }, minuteStep)
  }

  return normalizeTimeParts({ hours: rawHours, minutes: rawMinutes }, minuteStep)
}

const applyTimeParts = (date: Date, parts: TimeParts): Date => {
  const next = new Date(date)
  next.setHours(parts.hours, parts.minutes, 0, 0)
  return next
}

const getTimePartsFromDate = (date: Date | null, fallback: TimeParts): TimeParts => {
  if (!date) return fallback
  return { hours: date.getHours(), minutes: date.getMinutes() }
}

const withBoundaryTime = (
  range: DateRange,
  boundary: 'start' | 'end',
  parts: TimeParts,
): DateRange => {
  const target = boundary === 'start' ? range.start : range.end
  if (!target) return range

  const next = {
    start: range.start ? new Date(range.start) : null,
    end: range.end ? new Date(range.end) : null,
  }

  if (boundary === 'start' && next.start) next.start = applyTimeParts(next.start, parts)
  if (boundary === 'end' && next.end) next.end = applyTimeParts(next.end, parts)

  if (next.start && next.end && isSameDay(next.start, next.end) && next.start.getTime() > next.end.getTime()) {
    if (boundary === 'start') {
      next.start = new Date(next.end)
    } else {
      next.end = new Date(next.start)
    }
  }

  return next
}

const coerceRangeWithTime = (
  range: DateRange,
  previousRange: DateRange,
  startFallback: TimeParts,
  endFallback: TimeParts,
): DateRange => {
  const start =
    range.start
      ? applyTimeParts(
          range.start,
          previousRange.start && isSameDay(range.start, previousRange.start)
            ? { hours: previousRange.start.getHours(), minutes: previousRange.start.getMinutes() }
            : startFallback,
        )
      : null

  const end =
    range.end
      ? applyTimeParts(
          range.end,
          previousRange.end && isSameDay(range.end, previousRange.end)
            ? { hours: previousRange.end.getHours(), minutes: previousRange.end.getMinutes() }
            : endFallback,
        )
      : null

  return { start, end }
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
  numberOfMonths,
  showPresets = false,
  enableTime = false,
  timeFormat = '12h',
  minuteStep = 1,
  defaultStartTime,
  defaultEndTime,
  timeLabelIcon = null,
  timeLabelIconClassName = '',
  portal = true,
  portalContainer = null,
}: DateRangePickerProps) {
  const resolvedI18n = useMemo(() => resolveCalendarI18n(i18n), [i18n])
  const formatOptions = useMemo(
    () => ({ locale: resolvedI18n.locale }),
    [resolvedI18n.locale],
  )
  const normalizedMonths = clampNumberOfMonths(numberOfMonths)
  const normalizedMinuteStep = normalizeMinuteStep(minuteStep)
  const startTimeFallback = useMemo(
    () => parseTimeParts(defaultStartTime, DEFAULT_START_TIME, normalizedMinuteStep),
    [defaultStartTime, normalizedMinuteStep],
  )
  const endTimeFallback = useMemo(
    () => parseTimeParts(defaultEndTime, DEFAULT_END_TIME, normalizedMinuteStep),
    [defaultEndTime, normalizedMinuteStep],
  )
  const inputValueFormat = useMemo(
    () => (enableTime ? (timeFormat === '24h' ? 'PPP HH:mm' : 'PPP hh:mm a') : resolvedI18n.format.inputValue),
    [enableTime, resolvedI18n.format.inputValue, timeFormat],
  )
  const [open, setOpen] = useState(false)
  const [internalRange, setInternalRange] = useState<DateRange>(value ?? emptyRange)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
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
      if (popoverRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [open])

  useEffect(() => {
    if (!open || portal) return

    const frame = window.requestAnimationFrame(() => {
      const popover = popoverRef.current
      if (!popover) return

      const rect = popover.getBoundingClientRect()
      const overflowBottom = rect.bottom + POPOVER_VIEWPORT_PADDING - window.innerHeight
      if (overflowBottom > 0) {
        window.scrollBy({ top: overflowBottom, behavior: 'smooth' })
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open, portal])

  useEffect(() => {
    if (!open) return
    const nextFocus = selectedRange.start ?? selectedRange.end ?? new Date()
    setFocusDate(nextFocus)
  }, [open, selectedRange.start, selectedRange.end])

  const formattedStart = useMemo(
    () =>
      selectedRange.start
        ? format(selectedRange.start, inputValueFormat, formatOptions)
        : '',
    [selectedRange.start, inputValueFormat, formatOptions],
  )

  const formattedEnd = useMemo(
    () =>
      selectedRange.end
        ? format(selectedRange.end, inputValueFormat, formatOptions)
        : '',
    [selectedRange.end, inputValueFormat, formatOptions],
  )

  const placeholderStartText = placeholderStart ?? resolvedI18n.labels.startDatePlaceholder
  const placeholderEndText = placeholderEnd ?? resolvedI18n.labels.endDatePlaceholder
  const formatDescriptionText = formatDescription
    ?? (enableTime
      ? (timeFormat === '24h'
        ? 'Date and time format: MM/DD/YYYY HH:mm'
        : 'Date and time format: MM/DD/YYYY hh:mm AM/PM')
      : resolvedI18n.labels.formatDescription)

  const selectRange = (range: DateRange) => {
    const nextRange = enableTime
      ? coerceRangeWithTime(range, selectedRange, startTimeFallback, endTimeFallback)
      : range

    if (value === undefined) setInternalRange(nextRange)
    onChange?.(nextRange)
    if (nextRange.start && nextRange.end && !enableTime) {
      setOpen(false)
      inputRef.current?.focus()
    }
  }

  const updateRangeTime = (boundary: 'start' | 'end', parts: TimeParts) => {
    const nextRange = withBoundaryTime(selectedRange, boundary, normalizeTimeParts(parts, normalizedMinuteStep))
    if (nextRange === selectedRange) return
    if (value === undefined) setInternalRange(nextRange)
    onChange?.(nextRange)
  }

  const presetRanges = useMemo(
    () =>
      getDateRangePresets({
        today: resolvedI18n.labels.presetToday,
        last7Days: resolvedI18n.labels.presetLast7Days,
        last30Days: resolvedI18n.labels.presetLast30Days,
        thisQuarter: resolvedI18n.labels.presetThisQuarter,
        yearToDate: resolvedI18n.labels.presetYearToDate,
      }),
    [
      resolvedI18n.labels.presetLast30Days,
      resolvedI18n.labels.presetLast7Days,
      resolvedI18n.labels.presetThisQuarter,
      resolvedI18n.labels.presetToday,
      resolvedI18n.labels.presetYearToDate,
    ],
  )

  const applyPresetRange = (preset: DateRangePreset) => {
    const anchorDay = preset.range.end ?? preset.range.start
    if (anchorDay) {
      setFocusDate(anchorDay)
      cal.goToMonth(startOfMonth(anchorDay))
    }
    selectRange(preset.range)
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
    updateRangeTime,
    inputRef,
    containerRef,
    describedById,
    formattedStart,
    formattedEnd,
    placeholderStartText,
    placeholderEndText,
    formatDescriptionText,
    enableTime,
    timeFormat,
    minuteStep: normalizedMinuteStep,
    startDefaultTime: startTimeFallback,
    endDefaultTime: endTimeFallback,
    timeLabelIcon,
    timeLabelIconClassName,
    resolvedI18n,
    formatOptions,
    cal,
    focusDate,
    setFocusDate,
    gridRef,
    popoverRef,
    monthLabelId,
    numberOfMonths: normalizedMonths,
    portal,
    portalContainer,
    showPresets,
    presetRanges,
    applyPresetRange,
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
            <DateRangePicker.Input />
            <DateRangePicker.Calendar>
              <DateRangePicker.CalendarHeader />
              <DateRangePicker.CalendarGrid />
            </DateRangePicker.Calendar>
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
    enableTime,
  } = useDateRangePickerContext()

  const resolvedPlaceholderStart = placeholderStart ?? placeholderStartText
  const resolvedPlaceholderEnd = placeholderEnd ?? placeholderEndText
  const resolvedFormatDescription = formatDescription ?? formatDescriptionText

  const dateInputWidthClass = enableTime ? 'w-56' : 'w-40'

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-1">
          {iconPosition === 'left' && (
            <button
              type="button"
              onClick={() => setOpen(current => !current)}
              aria-label={iconAriaLabel}
              className={`inline-flex items-center justify-center rounded border border-gray-300 bg-white p-2 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${triggerClassName}`}
            >
              {renderPickerIcon(icon)}
            </button>
          )}
          <input
            readOnly
            className={`${dateInputWidthClass} rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-500 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${inputClassName}`}
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
              {renderPickerIcon(icon)}
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
              {renderPickerIcon(icon)}
            </button>
          )}
          <input
            readOnly
            className={`${dateInputWidthClass} rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-500 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${inputClassName}`}
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
              {renderPickerIcon(icon)}
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
  const { open, resolvedI18n, containerRef, popoverRef, portal, portalContainer } = useDateRangePickerContext()
  const [position, setPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 })
  const [hasPosition, setHasPosition] = useState(!portal)
  const bodyPaddingBaseRef = useRef<number | null>(null)
  const bodyPaddingInlineRef = useRef<string | null>(null)
  const bodyPaddingExtraRef = useRef(0)

  useLayoutEffect(() => {
    if (!open) {
      setHasPosition(!portal)
      return
    }

    if (!portal) {
      setHasPosition(true)
      return
    }

    const updatePosition = () => {
      const anchor = containerRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      setPosition({
        left: rect.left + window.scrollX,
        top: rect.bottom + window.scrollY + POPOVER_OFFSET,
      })
      setHasPosition(true)
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, portal, containerRef])

  useEffect(() => {
    const clearExtraBodyPadding = () => {
      if (bodyPaddingInlineRef.current !== null) {
        document.body.style.paddingBottom = bodyPaddingInlineRef.current
      }
      bodyPaddingInlineRef.current = null
      bodyPaddingBaseRef.current = null
      bodyPaddingExtraRef.current = 0
    }

    if (!open || !hasPosition) {
      clearExtraBodyPadding()
      return
    }

    const frame = window.requestAnimationFrame(() => {
      const popover = popoverRef.current
      if (!popover) return

      const rect = popover.getBoundingClientRect()
      const overflowBottom = rect.bottom + POPOVER_VIEWPORT_PADDING - window.innerHeight
      if (overflowBottom > 0) {
        if (portal) {
          if (bodyPaddingInlineRef.current === null) {
            bodyPaddingInlineRef.current = document.body.style.paddingBottom
            bodyPaddingBaseRef.current = parseFloat(window.getComputedStyle(document.body).paddingBottom) || 0
          }

          const maxScrollable =
            document.documentElement.scrollHeight - window.innerHeight - window.scrollY
          const neededExtraSpace = overflowBottom - Math.max(0, maxScrollable)

          if (neededExtraSpace > bodyPaddingExtraRef.current) {
            const nextExtra = Math.ceil(neededExtraSpace + POPOVER_VIEWPORT_PADDING)
            const basePadding = bodyPaddingBaseRef.current ?? 0
            document.body.style.paddingBottom = `${basePadding + nextExtra}px`
            bodyPaddingExtraRef.current = nextExtra
          }
        }

        window.scrollBy({ top: overflowBottom, behavior: 'smooth' })
      }
    })

    return () => {
      window.cancelAnimationFrame(frame)
      if (!open) clearExtraBodyPadding()
    }
  }, [open, hasPosition, position.left, position.top, popoverRef, portal])

  if (!open) return null
  if (portal && !hasPosition) return null

  const content = (
    <div
      ref={popoverRef}
      className={`${portal ? 'absolute' : 'absolute left-0 top-full mt-2'} rounded bg-white shadow ${popoverClassName}`}
      style={portal ? { left: position.left, top: position.top, zIndex: 'var(--rdp-z-popover, 1000)' } : { zIndex: 'var(--rdp-z-popover, 1000)' }}
      role="dialog"
      aria-label={resolvedI18n.labels.rangeCalendar}
    >
      <div className={`max-w-[calc(100vw-1rem)] rounded-lg border bg-white p-4 text-gray-900 shadow ${className}`}>
        {children ?? (
          <>
            <DateRangePickerCalendarHeader />
            <DateRangePickerCalendarGrid />
          </>
        )}
      </div>
    </div>
  )

  if (portal) {
    const target = portalContainer ?? (typeof document !== 'undefined' ? document.body : null)
    return target ? createPortal(content, target) : null
  }

  return (
    content
  )
}

function DateRangePickerCalendarHeader() {
  const { cal, resolvedI18n, formatOptions, numberOfMonths, monthLabelId, setFocusDate } = useDateRangePickerContext()

  const visibleMonths = useMemo(
    () => Array.from({ length: numberOfMonths }, (_, index) => addMonths(cal.currentMonth, index)),
    [cal.currentMonth, numberOfMonths],
  )

  const headerLabel = useMemo(() => {
    if (visibleMonths.length === 1) {
      return format(visibleMonths[0], resolvedI18n.format.monthLabel, formatOptions)
    }

    const first = format(visibleMonths[0], resolvedI18n.format.monthLabel, formatOptions)
    const last = format(
      visibleMonths[visibleMonths.length - 1],
      resolvedI18n.format.monthLabel,
      formatOptions,
    )
    return `${first} - ${last}`
  }, [visibleMonths, resolvedI18n.format.monthLabel, formatOptions])

  return (
    <header className="mb-3 flex items-center justify-between gap-3">
      <div className="flex gap-1">
        <button
          onClick={() => {
            cal.prevYear()
            setFocusDate(previous => addMonths(previous, -12))
          }}
          aria-label={resolvedI18n.labels.prevYear}
        >
          «
        </button>
        <button
          onClick={() => {
            cal.prev()
            setFocusDate(previous => addMonths(previous, -1))
          }}
          aria-label={resolvedI18n.labels.prevMonth}
        >
          ←
        </button>
      </div>
      <div id={monthLabelId} className="text-center text-sm font-semibold text-gray-900 sm:text-base">
        {headerLabel}
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => {
            cal.next()
            setFocusDate(previous => addMonths(previous, 1))
          }}
          aria-label={resolvedI18n.labels.nextMonth}
        >
          →
        </button>
        <button
          onClick={() => {
            cal.nextYear()
            setFocusDate(previous => addMonths(previous, 12))
          }}
          aria-label={resolvedI18n.labels.nextYear}
        >
          »
        </button>
      </div>
    </header>
  )
}

type TimeWheelOption<T extends string | number> = {
  value: T
  label: string
  ariaLabel: string
}

type TimeWheelColumnProps<T extends string | number> = {
  title: string
  ariaLabel: string
  options: TimeWheelOption<T>[]
  value: T
  disabled?: boolean
  onChange: (value: T) => void
}

function TimeWheelColumn<T extends string | number>({
  title,
  ariaLabel,
  options,
  value,
  disabled = false,
  onChange,
}: TimeWheelColumnProps<T>) {
  const optionIdBase = useId()
  const selectedRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const button = selectedRef.current
    if (!button || typeof button.scrollIntoView !== 'function') return
    button.scrollIntoView({ block: 'start' })
  }, [value])

  const selectedIndex = options.findIndex(option => option.value === value)
  const selectedOptionId = selectedIndex >= 0 ? `${optionIdBase}-option-${selectedIndex}` : undefined

  const setByIndex = (nextIndex: number) => {
    if (options.length === 0) return
    onChange(options[Math.max(0, Math.min(options.length - 1, nextIndex))].value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || options.length === 0) return

    const currentIndex = selectedIndex >= 0 ? selectedIndex : 0
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        setByIndex(currentIndex - 1)
        break
      case 'ArrowDown':
        event.preventDefault()
        setByIndex(currentIndex + 1)
        break
      case 'Home':
        event.preventDefault()
        setByIndex(0)
        break
      case 'End':
        event.preventDefault()
        setByIndex(options.length - 1)
        break
      case 'PageUp':
        event.preventDefault()
        setByIndex(currentIndex - 5)
        break
      case 'PageDown':
        event.preventDefault()
        setByIndex(currentIndex + 5)
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        setByIndex(currentIndex)
        break
      default:
        break
    }
  }

  return (
    <div className="flex w-16 flex-none flex-col gap-1">
      <div className="text-xs font-medium text-gray-600">{title}</div>
      <div
        className={`h-16 overflow-y-auto rounded border p-1 ${disabled ? 'cursor-not-allowed bg-gray-100' : 'bg-white'}`}
        onKeyDown={handleKeyDown}
        role="listbox"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-activedescendant={selectedOptionId}
        aria-orientation="vertical"
        aria-disabled={disabled}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value
          return (
            <button
              key={String(option.value)}
              id={`${optionIdBase}-option-${index}`}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              role="option"
              aria-selected={isSelected}
              tabIndex={-1}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              aria-label={`${ariaLabel} - ${option.ariaLabel}`}
              className={
                'w-full rounded px-2 py-1 text-left text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ' +
                (isSelected
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-blue-50')
              }
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const twoDigit = (value: number) => String(value).padStart(2, '0')

const getMeridiem = (hours: number) => (hours >= 12 ? 'PM' : 'AM')

const getTwelveHour = (hours: number) => {
  const normalized = hours % 12
  return normalized === 0 ? 12 : normalized
}

const toTwentyFourHour = (hour12: number, meridiem: 'AM' | 'PM') => {
  const normalized = hour12 % 12
  return meridiem === 'PM' ? normalized + 12 : normalized
}

function DateRangePickerTimeWheels() {
  const {
    enableTime,
    timeFormat,
    minuteStep,
    selectedRange,
    startDefaultTime,
    endDefaultTime,
    timeLabelIcon,
    timeLabelIconClassName,
    updateRangeTime,
  } = useDateRangePickerContext()
  const summaryId = useId()

  if (!enableTime) return null

  const startParts = getTimePartsFromDate(selectedRange.start, startDefaultTime)
  const endParts = getTimePartsFromDate(selectedRange.end, endDefaultTime)
  const minuteOptions: TimeWheelOption<number>[] = []
  for (let minute = 0; minute < 60; minute += minuteStep) {
    minuteOptions.push({
      value: minute,
      label: twoDigit(minute),
      ariaLabel: `Set minutes to ${twoDigit(minute)}`,
    })
  }

  const hour24Options: TimeWheelOption<number>[] = Array.from({ length: 24 }, (_, hour) => ({
    value: hour,
    label: twoDigit(hour),
    ariaLabel: `Set hour to ${twoDigit(hour)}`,
  }))

  const hour12Options: TimeWheelOption<number>[] = Array.from({ length: 12 }, (_, index) => {
    const hour = index + 1
    return {
      value: hour,
      label: String(hour),
      ariaLabel: `Set hour to ${hour}`,
    }
  })

  const periodOptions: TimeWheelOption<'AM' | 'PM'>[] = [
    { value: 'AM', label: 'AM', ariaLabel: 'Set period to AM' },
    { value: 'PM', label: 'PM', ariaLabel: 'Set period to PM' },
  ]

  const renderBoundaryWheels = (boundary: 'start' | 'end', parts: TimeParts, disabled: boolean) => {
    const meridiem = getMeridiem(parts.hours)
    const hour12 = getTwelveHour(parts.hours)
    const titlePrefix = boundary === 'start' ? 'Start' : 'End'
    const iconNode = timeLabelIcon ? normalizeIconNode(timeLabelIcon) : <DefaultClockIcon />

    return (
      <section className="rounded-md border border-gray-200 bg-gray-50/70 p-2">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <span className={`inline-flex h-4 w-4 items-center justify-center overflow-hidden text-gray-500 ${timeLabelIconClassName}`} aria-hidden="true">
            {iconNode}
          </span>
          <span>{titlePrefix} time</span>
        </div>
        <div className="flex gap-2">
          {timeFormat === '24h' ? (
            <>
              <TimeWheelColumn
                title="Hour"
                ariaLabel={`${titlePrefix} hour`}
                options={hour24Options}
                value={parts.hours}
                disabled={disabled}
                onChange={nextHour => updateRangeTime(boundary, { ...parts, hours: nextHour })}
              />
              <TimeWheelColumn
                title="Minute"
                ariaLabel={`${titlePrefix} minute`}
                options={minuteOptions}
                value={parts.minutes}
                disabled={disabled}
                onChange={nextMinute => updateRangeTime(boundary, { ...parts, minutes: nextMinute })}
              />
            </>
          ) : (
            <>
              <TimeWheelColumn
                title="Hour"
                ariaLabel={`${titlePrefix} hour`}
                options={hour12Options}
                value={hour12}
                disabled={disabled}
                onChange={nextHour =>
                  updateRangeTime(boundary, {
                    ...parts,
                    hours: toTwentyFourHour(nextHour, meridiem),
                  })}
              />
              <TimeWheelColumn
                title="Minute"
                ariaLabel={`${titlePrefix} minute`}
                options={minuteOptions}
                value={parts.minutes}
                disabled={disabled}
                onChange={nextMinute => updateRangeTime(boundary, { ...parts, minutes: nextMinute })}
              />
              <TimeWheelColumn
                title="AM/PM"
                ariaLabel={`${titlePrefix} period`}
                options={periodOptions}
                value={meridiem}
                disabled={disabled}
                onChange={nextPeriod =>
                  updateRangeTime(boundary, {
                    ...parts,
                    hours: toTwentyFourHour(hour12, nextPeriod),
                  })}
              />
            </>
          )}
        </div>
      </section>
    )
  }

  const startSummary = selectedRange.start
    ? format(selectedRange.start, timeFormat === '24h' ? 'PPP HH:mm' : 'PPP hh:mm a')
    : 'not selected'
  const endSummary = selectedRange.end
    ? format(selectedRange.end, timeFormat === '24h' ? 'PPP HH:mm' : 'PPP hh:mm a')
    : 'not selected'

  return (
    <section className="mt-2 border-t pt-3" aria-label="Time range selectors" aria-describedby={summaryId}>
      <div className="mb-2 text-sm font-semibold text-gray-800">Time range</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {renderBoundaryWheels('start', startParts, !selectedRange.start)}
        {renderBoundaryWheels('end', endParts, !selectedRange.end)}
      </div>
      <span id={summaryId} style={visuallyHidden} aria-live="polite">
        {`Start ${startSummary}. End ${endSummary}.`}
      </span>
    </section>
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
    numberOfMonths,
    showPresets,
    presetRanges,
    applyPresetRange,
    onEscape,
  } = useDateRangePickerContext()

  const weekOptions = useMemo(
    () => ({ locale: resolvedI18n.locale, weekStartsOn: resolvedI18n.weekStartsOn }),
    [resolvedI18n.locale, resolvedI18n.weekStartsOn],
  )

  const visibleMonths = useMemo(
    () =>
      Array.from({ length: numberOfMonths }, (_, index) => {
        const monthStart = startOfMonth(addMonths(cal.currentMonth, index))
        return {
          monthStart,
          weeks: buildMonthWeeks(monthStart, weekOptions),
          weekdayLabels: buildMonthWeeks(monthStart, weekOptions)[0].map(day =>
            format(day, resolvedI18n.format.weekdayLabel, formatOptions),
          ),
        } satisfies MonthView
      }),
    [
      cal.currentMonth,
      numberOfMonths,
      weekOptions,
      resolvedI18n.format.weekdayLabel,
      formatOptions,
    ],
  )

  const visibleRangeDays = useMemo(
    () => getVisibleRangeDays(cal.currentMonth, numberOfMonths, weekOptions),
    [cal.currentMonth, numberOfMonths, weekOptions],
  )

  const monthAnimatorRef = useRef<HTMLDivElement>(null)
  const previousMonthRef = useRef(cal.currentMonth)

  useEffect(() => {
    const monthOffset = differenceInCalendarMonths(startOfMonth(focusDate), startOfMonth(cal.currentMonth))

    if (monthOffset < 0) {
      cal.goToMonth(startOfMonth(focusDate))
      return
    }

    if (monthOffset >= numberOfMonths) {
      cal.goToMonth(addMonths(startOfMonth(focusDate), -(numberOfMonths - 1)))
    }
  }, [focusDate, cal, numberOfMonths])

  useEffect(() => {
    const prev = previousMonthRef.current
    const next = cal.currentMonth
    const monthDelta = differenceInCalendarMonths(startOfMonth(next), startOfMonth(prev))

    if (monthDelta === 0 || !monthAnimatorRef.current || typeof monthAnimatorRef.current.animate !== 'function') {
      previousMonthRef.current = next
      return
    }

    monthAnimatorRef.current.animate(
      [
        { opacity: 0.88, transform: `translateX(${monthDelta > 0 ? '10px' : '-10px'})` },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      {
        duration: 180,
        easing: 'ease-out',
      },
    )

    previousMonthRef.current = next
  }, [cal.currentMonth])

  useEffect(() => {
    const focusMonthOffset = differenceInCalendarMonths(
      startOfMonth(focusDate),
      startOfMonth(cal.currentMonth),
    )
    const focusPanelIndex =
      focusMonthOffset < 0 ? 0 : Math.min(numberOfMonths - 1, focusMonthOffset)
    const focusPanelMonth = visibleMonths[focusPanelIndex]?.monthStart ?? visibleMonths[0]?.monthStart

    if (!focusPanelMonth) return

    const cell = gridRef.current?.querySelector<HTMLButtonElement>(
      `button[role="gridcell"][data-date-key="${focusDate.getTime()}-${focusPanelMonth.getTime()}"]`,
    )
    cell?.focus()
  }, [cal.currentMonth, focusDate, gridRef, numberOfMonths, visibleMonths])

  const moveFocusByDays = (delta: number) => {
    setFocusDate(previous => addDays(previous, delta))
  }

  const isPresetActive = (preset: DateRangePreset) => {
    if (!selectedRange.start || !selectedRange.end || !preset.range.start || !preset.range.end) {
      return false
    }

    return (
      cal.isSameDay(selectedRange.start, preset.range.start) &&
      cal.isSameDay(selectedRange.end, preset.range.end)
    )
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = visibleRangeDays.findIndex(day => cal.isSameDay(day, focusDate))
    const currentIndex = idx >= 0 ? idx : 0
    const rowStart = currentIndex - (currentIndex % 7)

    const setByIndex = (nextIndex: number) => {
      if (nextIndex < 0) {
        moveFocusByDays(nextIndex - currentIndex)
        return
      }

      if (nextIndex >= visibleRangeDays.length) {
        moveFocusByDays(nextIndex - currentIndex)
        return
      }

      setFocusDate(visibleRangeDays[nextIndex])
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
        setFocusDate(previous => addMonths(previous, event.shiftKey ? -12 : -1))
        break
      case 'PageDown':
        event.preventDefault()
        setFocusDate(previous => addMonths(previous, event.shiftKey ? 12 : 1))
        break
      case 'Escape':
        event.preventDefault()
        onEscape()
        break
      case ' ':
      case 'Enter':
        event.preventDefault()
        selectRange(cal.nextRange(focusDate, selectedRange))
        break
      default:
        break
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {showPresets && (
        <section aria-label={resolvedI18n.labels.presetsTitle}>
          <div className="flex flex-wrap gap-2">
            {presetRanges.map(preset => (
              <button
                key={preset.key}
                type="button"
                onClick={() => applyPresetRange(preset)}
                className={
                  'rounded border px-2 py-1 text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:text-sm ' +
                  (isPresetActive(preset)
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50')
                }
              >
                {preset.label}
              </button>
            ))}
          </div>
        </section>
      )}
      <div role="grid" tabIndex={0} aria-labelledby={monthLabelId} onKeyDown={handleKeyDown} ref={gridRef}>
      <div ref={monthAnimatorRef} className="flex flex-col gap-4 sm:flex-row sm:gap-3">
        {visibleMonths.map(monthView => (
          <section
            key={monthView.monthStart.getTime()}
            className="w-72 rounded-md border border-gray-200 bg-gray-50/50 p-2 sm:w-64"
          >
            <div className="mb-1 text-center text-sm font-medium text-gray-700">
              {format(monthView.monthStart, resolvedI18n.format.monthLabel, formatOptions)}
            </div>
            <div className="mb-1 grid grid-cols-7 text-sm text-gray-600" aria-hidden="true">
              {monthView.weekdayLabels.map((label, index) => (
                <div key={`${monthView.monthStart.getTime()}-weekday-${index}`} className="text-center">
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthView.weeks.map((week, weekIndex) =>
                week.map((day, dayIndex) => {
                  const faded = !cal.isSameMonth(day, monthView.monthStart)
                  const isRangeEdge = cal.isRangeEdge(day, selectedRange)
                  const inRange = cal.isInRange(day, selectedRange)
                  const isFocused = cal.isSameDay(day, focusDate) && cal.isSameMonth(day, focusDate)

                  return (
                    <button
                      key={`${monthView.monthStart.getTime()}-${weekIndex}-${dayIndex}`}
                      role="gridcell"
                      aria-selected={isRangeEdge}
                      aria-disabled={faded}
                      tabIndex={isFocused ? 0 : -1}
                      data-date-key={`${day.getTime()}-${monthView.monthStart.getTime()}`}
                      onClick={() => {
                        const nextRange = cal.nextRange(day, selectedRange)
                        setFocusDate(day)
                        selectRange(nextRange)
                      }}
                      className={
                        'rounded border border-transparent p-1 text-gray-900 transition-colors duration-150 hover:border-blue-400 focus-visible:border-blue-500 focus-visible:outline-none ' +
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
          </section>
        ))}
      </div>
    </div>
    <DateRangePickerTimeWheels />
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

function DefaultClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
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
