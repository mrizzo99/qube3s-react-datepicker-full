import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import DateRangeInput from './DateRangeInput'
import { format } from 'date-fns'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (label: string) =>
  screen.getAllByRole('gridcell').find(btn => btn.textContent === label && !btn.classList.contains('text-gray-300'))

describe('DateRangeInput', () => {
  beforeEach(() => vi.setSystemTime(jan102024))
  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('selects start and end dates and closes the popover (uncontrolled)', async () => {
    const onChange = vi.fn()
    render(<DateRangeInput onChange={onChange} />)

    const startInput = screen.getByPlaceholderText('Start date')
    const endInput = screen.getByPlaceholderText('End date')

    await userEvent.click(startInput)
    expect(screen.getByText('January 2024')).toBeInTheDocument()

    const day5 = getCurrentMonthDay('5')!
    const day7 = getCurrentMonthDay('7')!
    await userEvent.click(day5)
    await userEvent.click(day7)

    expect(onChange).toHaveBeenCalledTimes(2)
    expect(startInput).toHaveValue(format(new Date(2024, 0, 5), 'PPP'))
    expect(endInput).toHaveValue(format(new Date(2024, 0, 7), 'PPP'))
    expect(screen.queryByText('January 2024')).not.toBeInTheDocument()
  })

  it('renders controlled start/end values', () => {
    const value = { start: new Date(2024, 0, 3), end: new Date(2024, 0, 8) }
    render(<DateRangeInput value={value} />)

    expect(screen.getByPlaceholderText('Start date')).toHaveValue(format(value.start!, 'PPP'))
    expect(screen.getByPlaceholderText('End date')).toHaveValue(format(value.end!, 'PPP'))
  })
})
