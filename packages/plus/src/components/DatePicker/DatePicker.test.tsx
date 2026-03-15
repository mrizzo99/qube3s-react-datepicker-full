import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { format } from 'date-fns'
import DatePicker from './DatePicker'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (label: string) =>
  screen
    .getAllByRole('gridcell')
    .find(button => button.textContent === label)

describe('Plus DatePicker', () => {
  beforeEach(() => vi.setSystemTime(jan102024))

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('supports the same compound structure for selecting an allowed date', async () => {
    const onChange = vi.fn()

    render(
      <DatePicker
        onChange={onChange}
        minDate={new Date(2024, 0, 5)}
        maxDate={new Date(2024, 0, 20)}
      >
        <DatePicker.Input />
        <DatePicker.Calendar>
          <DatePicker.CalendarHeader />
          <DatePicker.CalendarGrid />
        </DatePicker.Calendar>
      </DatePicker>,
    )

    const input = screen.getByRole('textbox')
    await userEvent.click(input)
    await userEvent.click(getCurrentMonthDay('5')!)

    expect(onChange).toHaveBeenCalledWith(expect.any(Date))
    expect(input).toHaveValue(format(new Date(2024, 0, 5), 'PPP'))
  })

  it('disables dates outside min/max bounds', async () => {
    const onChange = vi.fn()

    render(
      <DatePicker
        onChange={onChange}
        minDate={new Date(2024, 0, 5)}
        maxDate={new Date(2024, 0, 20)}
      />,
    )

    const input = screen.getByRole('textbox')
    await userEvent.click(input)

    const day4 = getCurrentMonthDay('4')!
    const day5 = getCurrentMonthDay('5')!
    const day21 = getCurrentMonthDay('21')!

    expect(day4).toHaveAttribute('aria-disabled', 'true')
    expect(day5).toHaveAttribute('aria-disabled', 'false')
    expect(day21).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(day4)
    expect(onChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('')

    await userEvent.click(day5)
    expect(onChange).toHaveBeenCalledWith(expect.any(Date))
    expect(input).toHaveValue(format(new Date(2024, 0, 5), 'PPP'))
  })

  it('blocks weekend selection from keyboard input', async () => {
    const onChange = vi.fn()

    render(<DatePicker onChange={onChange} blockWeekends />)

    await userEvent.click(screen.getByRole('textbox'))

    const day6 = getCurrentMonthDay('6')!
    const day7 = getCurrentMonthDay('7')!
    const day8 = getCurrentMonthDay('8')!

    expect(day6).toHaveAttribute('aria-disabled', 'true')
    expect(day7).toHaveAttribute('aria-disabled', 'true')
    expect(day8).toHaveAttribute('aria-disabled', 'false')

    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}')
    await userEvent.keyboard('{Enter}')
    expect(onChange).not.toHaveBeenCalled()

    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await userEvent.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(expect.any(Date))
  })
})
