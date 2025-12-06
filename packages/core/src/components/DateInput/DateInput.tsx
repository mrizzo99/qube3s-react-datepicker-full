
import React, { useEffect, useMemo, useState } from 'react'
import Calendar from '../Calendar'
import { format } from 'date-fns'

export type DateInputProps = {
  value?: Date | null
  onChange?: (date: Date) => void
  placeholder?: string
}

export default function DateInput({ value, onChange, placeholder = 'Select date' }: DateInputProps) {
  const [open, setOpen] = useState(false)
  const [internalDate, setInternalDate] = useState<Date | null>(value ?? null)

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
  }

  return (
    <div className="relative inline-block">
      <input
        readOnly
        className="border p-2 rounded w-48"
        placeholder={placeholder}
        onClick={() => setOpen(o => !o)}
        value={formatted}
      />
      {open && (
        <div className="absolute top-full left-0 mt-2 z-10 bg-white shadow rounded">
          <Calendar selectedDate={selectedDate} selectDate={handleSelectDate} />
        </div>
      )}
    </div>
  )
}
