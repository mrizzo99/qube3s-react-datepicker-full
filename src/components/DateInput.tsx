
import React, { useState } from 'react'
import Calendar from './Calendar'

export default function DateInput() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <input
        readOnly
        className="border p-2 rounded w-48"
        placeholder="Select date"
        onClick={() => setOpen(o => !o)}
      />
      {open && (
        <div className="absolute top-full left-0 mt-2 z-10 bg-white shadow rounded">
          <Calendar />
        </div>
      )}
    </div>
  )
}
