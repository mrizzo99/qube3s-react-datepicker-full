import React, { useState } from 'react'
import DateInput from './components/DateInput'
import { format } from 'date-fns'

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  return (
    <div className="p-8">
      <h1 className="text-xl mb-4">React Datepicker Starter</h1>
      <div className="space-y-2">
        <DateInput value={selectedDate} onChange={setSelectedDate} />
        <p className="text-gray-600">
          {selectedDate ? `Selected: ${format(selectedDate, 'PPP')}` : 'Choose a date'}
        </p>
      </div>
    </div>
  )
}
