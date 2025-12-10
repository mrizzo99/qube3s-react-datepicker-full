
import React, { useEffect, useMemo, useRef, useState, useId } from 'react'
import Calendar from '../Calendar'
import { format } from 'date-fns'

export type DateInputProps = {
  value?: Date | null
  onChange?: (date: Date) => void
  placeholder?: string
  formatDescription?: string
}

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

export default function DateInput({
  value,
  onChange,
  placeholder = 'Select date',
  formatDescription = 'Date format: MM/DD/YYYY'
}: DateInputProps) {
  const [open, setOpen] = useState(false)
  const [internalDate, setInternalDate] = useState<Date | null>(value ?? null)
  const inputRef = useRef<HTMLInputElement>(null)
  // unique ID for the hidden date format hint; avoids collisions across instances
  const describedById = useId()

  useEffect(() => {
    if (value !== undefined) setInternalDate(value ?? null)
  }, [value])

  const selectedDate = value ?? internalDate

  const formatted = useMemo(
    () => (selectedDate ? format(selectedDate, 'PPP') : ''),
    [selectedDate]
  )

  const handleSelectDate = (date: Date) => {
    if (value === undefined) setInternalDate(date)
    onChange?.(date)
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative inline-block">
      <input
        readOnly
        className="border p-2 rounded w-48"
        placeholder={placeholder}
        onClick={() => setOpen(o => !o)}
        value={formatted}
        ref={inputRef}
        aria-haspopup="grid"
        aria-expanded={open}
        aria-describedby={describedById}
      />
      <span id={describedById} style={visuallyHidden}>
        {formatDescription}
      </span>
      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-10 bg-white shadow rounded"
          role="dialog"
          aria-label="Calendar"
        >
          <Calendar
            selectedDate={selectedDate}
            selectDate={handleSelectDate}
            onEscape={() => {
              setOpen(false)
              inputRef.current?.focus()
            }}
          />
        </div>
      )}
    </div>
  )
}
