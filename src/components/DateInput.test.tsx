import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import DateInput from './DateInput'
import { format } from 'date-fns'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (label: string) =>
  screen.getAllByRole('button', { name: label }).find(btn => !btn.classList.contains('text-gray-300'))

describe('DateInput', () => {
  beforeEach(() => vi.setSystemTime(jan102024))
  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('opens the popover and selects a date (uncontrolled)', async () => {
    const onChange = vi.fn()
    render(<DateInput onChange={onChange} />)

    const input = screen.getByRole('textbox')
    await userEvent.click(input)

    expect(screen.getByText('January 2024')).toBeInTheDocument()

    const day5 = getCurrentMonthDay('5')!
    await userEvent.click(day5)

    expect(onChange).toHaveBeenCalledWith(expect.any(Date))
    expect(screen.queryByText('January 2024')).not.toBeInTheDocument()
    expect(input).toHaveValue(format(new Date(2024, 0, 5), 'PPP'))
  })

  it('renders a controlled value', () => {
    const value = new Date(2024, 0, 12)
    render(<DateInput value={value} />)
    expect(screen.getByRole('textbox')).toHaveValue(format(value, 'PPP'))
  })
})
