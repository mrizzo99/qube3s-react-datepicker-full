import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { format } from 'date-fns'
import DateRangePicker from './DateRangePicker'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (label: string) =>
  screen
    .getAllByRole('gridcell')
    .find(button => button.textContent === label && !button.classList.contains('text-gray-300'))

describe('DateRangePicker', () => {
  beforeEach(() => vi.setSystemTime(jan102024))

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('supports the compound structure for selecting a range', async () => {
    const onChange = vi.fn()

    render(
      <DateRangePicker onChange={onChange}>
        <DateRangePicker.Input />
        <DateRangePicker.Calendar>
          <DateRangePicker.CalendarHeader />
          <DateRangePicker.CalendarGrid />
        </DateRangePicker.Calendar>
      </DateRangePicker>,
    )

    const startInput = screen.getByPlaceholderText('Start date')
    const endInput = screen.getByPlaceholderText('End date')

    await userEvent.click(startInput)

    const day5 = getCurrentMonthDay('5')!
    const day7 = getCurrentMonthDay('7')!
    await userEvent.click(day5)
    await userEvent.click(day7)

    expect(onChange).toHaveBeenCalledTimes(2)
    expect(startInput).toHaveValue(format(new Date(2024, 0, 5), 'PPP'))
    expect(endInput).toHaveValue(format(new Date(2024, 0, 7), 'PPP'))
  })
})
