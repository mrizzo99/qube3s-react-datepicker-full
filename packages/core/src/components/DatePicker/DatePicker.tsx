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
  popoverRef: React.RefObject<HTMLDivElement | null>
  monthLabelId: string
  portal: boolean
  portalContainer: HTMLElement | null
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

const POPOVER_VIEWPORT_PADDING = 16
const POPOVER_OFFSET = 8
const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

const getFocusableElements = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    element =>
      !element.hasAttribute('disabled')
      && element.getAttribute('aria-hidden') !== 'true'
      && !element.hasAttribute('inert'),
  )

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

export type DatePickerProps = {
  children?: React.ReactNode
  value?: Date | null
  onChange?: (date: Date) => void
  placeholder?: string
  formatDescription?: string
  i18n?: CalendarI18n
  portal?: boolean
  portalContainer?: HTMLElement | null
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
  portal = true,
  portalContainer = null,
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
  const popoverRef = useRef<HTMLDivElement>(null)
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
    popoverRef,
    monthLabelId,
    portal,
    portalContainer,
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
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
    }
  }

  return (
    <>
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
        className={`w-48 rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-500 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${inputClassName}`}
        placeholder={resolvedPlaceholder}
        onClick={() => setOpen(current => !current)}
        onKeyDown={handleInputKeyDown}
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
            {renderPickerIcon(icon)}
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
  const { open, resolvedI18n, containerRef, popoverRef, portal, portalContainer, onEscape } = useDatePickerContext()
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

  useEffect(() => {
    if (!open) return
    if (portal && !hasPosition) return

    const frame = window.requestAnimationFrame(() => {
      const dialog = popoverRef.current
      if (!dialog) return
      const initialTarget = dialog.querySelector<HTMLElement>('[data-initial-focus="true"]')
        ?? dialog.querySelector<HTMLElement>('[role="grid"]')
        ?? getFocusableElements(dialog)[0]
      initialTarget?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open, hasPosition, portal, popoverRef])

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented && event.key !== 'Tab') return

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onEscape()
      return
    }

    if (event.key !== 'Tab') return

    const dialog = popoverRef.current
    if (!dialog) return
    const focusable = getFocusableElements(dialog)
    if (focusable.length === 0) {
      event.preventDefault()
      dialog.focus()
      return
    }

    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const activeIndex = activeElement ? focusable.indexOf(activeElement) : -1

    if (event.shiftKey) {
      if (activeIndex <= 0) {
        event.preventDefault()
        focusable[focusable.length - 1].focus()
      }
      return
    }

    if (activeIndex === -1 || activeIndex === focusable.length - 1) {
      event.preventDefault()
      focusable[0].focus()
    }
  }

  if (!open) return null
  if (portal && !hasPosition) return null

  const content = (
    <div
      ref={popoverRef}
      className={`${portal ? 'absolute' : 'absolute left-0 top-full mt-2'} rounded bg-white shadow ${popoverClassName}`}
      style={portal ? { left: position.left, top: position.top, zIndex: 'var(--rdp-z-popover, 1000)' } : { zIndex: 'var(--rdp-z-popover, 1000)' }}
      role="dialog"
      aria-label={resolvedI18n.labels.calendar}
      tabIndex={-1}
      onKeyDown={handleDialogKeyDown}
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

  if (portal) {
    const target = portalContainer ?? (typeof document !== 'undefined' ? document.body : null)
    return target ? createPortal(content, target) : null
  }

  return (
    content
  )
}

function DatePickerCalendarHeader() {
  const { cal, resolvedI18n, formatOptions, monthLabelId } = useDatePickerContext()

  return (
    <header className="mb-2 flex justify-between">
      <div className="flex gap-1">
        <button onClick={cal.prevYear} aria-label={resolvedI18n.labels.prevYear}>«</button>
        <button onClick={cal.prev} aria-label={resolvedI18n.labels.prevMonth}>←</button>
      </div>
      <div id={monthLabelId} className="font-semibold text-gray-900">
        {format(cal.currentMonth, resolvedI18n.format.monthLabel, formatOptions)}
      </div>
      <div className="flex gap-1">
        <button onClick={cal.next} aria-label={resolvedI18n.labels.nextMonth}>→</button>
        <button onClick={cal.nextYear} aria-label={resolvedI18n.labels.nextYear}>»</button>
      </div>
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
  }, [cal.currentMonth, gridDays, focusDate])

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
        if (event.shiftKey) {
          cal.prevYear()
          setFocusDate(addMonths(focusDate, -12))
        } else {
          cal.prev()
          setFocusDate(addMonths(focusDate, -1))
        }
        break
      case 'PageDown':
        event.preventDefault()
        if (event.shiftKey) {
          cal.nextYear()
          setFocusDate(addMonths(focusDate, 12))
        } else {
          cal.next()
          setFocusDate(addMonths(focusDate, 1))
        }
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
    <div
      role="grid"
      tabIndex={0}
      aria-labelledby={monthLabelId}
      onKeyDown={handleKeyDown}
      ref={gridRef}
      data-initial-focus="true"
    >
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
