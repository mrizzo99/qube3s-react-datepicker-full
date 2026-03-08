import React, { useEffect, useMemo, useRef, useState, useId } from 'react'
import RangeCalendar from '../RangeCalendar'
import { format } from 'date-fns'
import type { DateRange } from '../../headless/useRangeCalendar'
import { resolveCalendarI18n, type CalendarI18n } from '@core/i18n'

export type DateRangeInputProps = {
  value?: DateRange | null
  onChange?: (range: DateRange) => void
  placeholderStart?: string
  placeholderEnd?: string
  formatDescription?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  iconAriaLabel?: string
  inputClassName?: string
  triggerClassName?: string
  i18n?: CalendarI18n
}

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

export default function DateRangeInput({
  value,
  onChange,
  placeholderStart,
  placeholderEnd,
  formatDescription,
  icon,
  iconPosition = 'right',
  iconAriaLabel = 'Open calendar',
  inputClassName = '',
  triggerClassName = '',
  i18n
}: DateRangeInputProps) {
  const resolvedI18n = useMemo(() => resolveCalendarI18n(i18n), [i18n])
  const formatOptions = useMemo(
    () => ({ locale: resolvedI18n.locale }),
    [resolvedI18n.locale]
  )
  const [open, setOpen] = useState(false)
  const [internalRange, setInternalRange] = useState<DateRange>(value ?? emptyRange)
  const containerRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLInputElement>(null)
  // unique ID for the hidden date format hint; avoids collisions across instances
  const describedById = useId()

  useEffect(() => {
    if (value !== undefined) setInternalRange(value ?? emptyRange)
  }, [value])

  const selectedRange = value ?? internalRange

  const formattedStart = useMemo(
    () =>
      selectedRange.start
        ? format(selectedRange.start, resolvedI18n.format.inputValue, formatOptions)
        : '',
    [selectedRange.start, resolvedI18n.format.inputValue, formatOptions]
  )
  const formattedEnd = useMemo(
    () =>
      selectedRange.end
        ? format(selectedRange.end, resolvedI18n.format.inputValue, formatOptions)
        : '',
    [selectedRange.end, resolvedI18n.format.inputValue, formatOptions]
  )
  const placeholderStartText = placeholderStart ?? resolvedI18n.labels.startDatePlaceholder
  const placeholderEndText = placeholderEnd ?? resolvedI18n.labels.endDatePlaceholder
  const formatDescriptionText = formatDescription ?? resolvedI18n.labels.formatDescription

  const handleSelectRange = (range: DateRange) => {
    if (value === undefined) setInternalRange(range)
    onChange?.(range)
    if (range.start && range.end) setOpen(false)
    if (range.start && range.end) startRef.current?.focus()
  }

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

  return (
    <div
      ref={containerRef}
      className="relative inline-flex flex-col gap-2"
      style={open ? { zIndex: 'var(--rdp-z-popover, 1000)' } : undefined}
    >
      <div className="flex gap-2">
        <div className="inline-flex items-center gap-1">
          {iconPosition === 'left' && (
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              aria-label={iconAriaLabel}
              className={`inline-flex items-center justify-center p-2 border border-gray-300 rounded hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-white ${triggerClassName}`}
            >
              {icon ?? <DefaultCalendarIcon />}
            </button>
          )}
          <input
            readOnly
            className={`w-40 rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-500 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${inputClassName}`}
            placeholder={placeholderStartText}
            onClick={() => setOpen(o => !o)}
            value={formattedStart}
            ref={startRef}
            aria-haspopup="grid"
            aria-expanded={open}
            aria-describedby={describedById}
          />
          {iconPosition === 'right' && (
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              aria-label={iconAriaLabel}
              className={`inline-flex items-center justify-center p-2 border border-gray-300 rounded hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-white ${triggerClassName}`}
            >
              {icon ?? <DefaultCalendarIcon />}
            </button>
          )}
        </div>
        <div className="inline-flex items-center gap-1">
          {iconPosition === 'left' && (
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              aria-label={iconAriaLabel}
              className={`inline-flex items-center justify-center p-2 border border-gray-300 rounded hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-white ${triggerClassName}`}
            >
              {icon ?? <DefaultCalendarIcon />}
            </button>
          )}
          <input
            readOnly
            className={`w-40 rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder:text-gray-500 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${inputClassName}`}
            placeholder={placeholderEndText}
            onClick={() => setOpen(o => !o)}
            value={formattedEnd}
            aria-describedby={describedById}
          />
          {iconPosition === 'right' && (
            <button
              type="button"
              onClick={() => setOpen(o => !o)}
              aria-label={iconAriaLabel}
              className={`inline-flex items-center justify-center p-2 border border-gray-300 rounded hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-white ${triggerClassName}`}
            >
              {icon ?? <DefaultCalendarIcon />}
            </button>
          )}
        </div>
      </div>
      <span id={describedById} style={visuallyHidden}>
        {formatDescriptionText}
      </span>
      {open && (
        <div
          className="absolute top-full left-0 mt-2 rounded bg-white shadow"
          style={{ zIndex: 'var(--rdp-z-popover, 1000)' }}
          role="dialog"
          aria-label={resolvedI18n.labels.rangeCalendar}
        >
          <RangeCalendar
            selectedRange={selectedRange}
            selectRange={handleSelectRange}
            i18n={i18n}
            onEscape={() => {
              setOpen(false)
              startRef.current?.focus()
            }}
          />
        </div>
      )}
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
