import React, { useEffect, useMemo, useRef, useState, useId } from 'react'
import RangeCalendar from '../RangeCalendar'
import { format } from 'date-fns'
import type { DateRange } from '../../headless/useRangeCalendar'

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
  placeholderStart = 'Start date',
  placeholderEnd = 'End date',
  formatDescription = 'Date format: MM/DD/YYYY',
  icon,
  iconPosition = 'right',
  iconAriaLabel = 'Open calendar',
  inputClassName = '',
  triggerClassName = ''
}: DateRangeInputProps) {
  const [open, setOpen] = useState(false)
  const [internalRange, setInternalRange] = useState<DateRange>(value ?? emptyRange)
  const startRef = useRef<HTMLInputElement>(null)
  // unique ID for the hidden date format hint; avoids collisions across instances
  const describedById = useId()

  useEffect(() => {
    if (value !== undefined) setInternalRange(value ?? emptyRange)
  }, [value])

  const selectedRange = value ?? internalRange

  const formattedStart = useMemo(
    () => (selectedRange.start ? format(selectedRange.start, 'PPP') : ''),
    [selectedRange.start]
  )
  const formattedEnd = useMemo(
    () => (selectedRange.end ? format(selectedRange.end, 'PPP') : ''),
    [selectedRange.end]
  )

  const handleSelectRange = (range: DateRange) => {
    if (value === undefined) setInternalRange(range)
    onChange?.(range)
    if (range.start && range.end) setOpen(false)
    if (range.start && range.end) startRef.current?.focus()
  }

  return (
    <div className="relative inline-flex flex-col gap-2">
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
            className={`border border-gray-300 p-2 rounded w-40 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${inputClassName}`}
            placeholder={placeholderStart}
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
            className={`border border-gray-300 p-2 rounded w-40 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${inputClassName}`}
            placeholder={placeholderEnd}
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
        {formatDescription}
      </span>
      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-10 bg-white shadow rounded"
          role="dialog"
          aria-label="Range calendar"
        >
          <RangeCalendar
            selectedRange={selectedRange}
            selectRange={handleSelectRange}
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
