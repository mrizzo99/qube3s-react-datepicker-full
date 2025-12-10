import React, { useEffect, useMemo, useRef, useState, useId } from 'react'
import RangeCalendar from '../RangeCalendar'
import { format } from 'date-fns'
import type { DateRange } from '@core/headless/useCalendar'

export type DateRangeInputProps = {
  value?: DateRange | null
  onChange?: (range: DateRange) => void
  placeholderStart?: string
  placeholderEnd?: string
  formatDescription?: string
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
  formatDescription = 'Date format: MM/DD/YYYY'
}: DateRangeInputProps) {
  const [open, setOpen] = useState(false)
  const [internalRange, setInternalRange] = useState<DateRange>(value ?? emptyRange)
  const startRef = useRef<HTMLInputElement>(null)
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
        <input
          readOnly
          className="border p-2 rounded w-40"
          placeholder={placeholderStart}
          onClick={() => setOpen(o => !o)}
          value={formattedStart}
          ref={startRef}
          aria-haspopup="grid"
          aria-expanded={open}
          aria-describedby={describedById}
        />
        <input
          readOnly
          className="border p-2 rounded w-40"
          placeholder={placeholderEnd}
          onClick={() => setOpen(o => !o)}
          value={formattedEnd}
          aria-describedby={describedById}
        />
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
