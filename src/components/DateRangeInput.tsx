import React, { useEffect, useMemo, useState } from 'react'
import Calendar from './Calendar'
import { format } from 'date-fns'
import type { DateRange } from '../headless/useCalendar'

type DateRangeInputProps = {
  value?: DateRange | null
  onChange?: (range: DateRange) => void
  placeholderStart?: string
  placeholderEnd?: string
}

const emptyRange: DateRange = { start: null, end: null }

export default function DateRangeInput({
  value,
  onChange,
  placeholderStart = 'Start date',
  placeholderEnd = 'End date'
}: DateRangeInputProps) {
  const [open, setOpen] = useState(false)
  const [internalRange, setInternalRange] = useState<DateRange>(value ?? emptyRange)

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
        />
        <input
          readOnly
          className="border p-2 rounded w-40"
          placeholder={placeholderEnd}
          onClick={() => setOpen(o => !o)}
          value={formattedEnd}
        />
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-2 z-10 bg-white shadow rounded">
          <Calendar mode="range" selectedRange={selectedRange} selectRange={handleSelectRange} />
        </div>
      )}
    </div>
  )
}
