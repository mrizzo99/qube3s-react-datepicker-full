import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { format } from 'date-fns'
import type { AsyncValidationResult } from '@core/asyncValidation'
import DatePicker from './DatePicker'
import { fluentAnimationPack } from '../../presets/animationPack'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

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

  it('keeps the calendar open while plus async validation is pending and shows server errors', async () => {
    const onChange = vi.fn()
    const deferred = createDeferred<AsyncValidationResult>()

    render(
      <DatePicker
        onChange={onChange}
        validateAsync={() => deferred.promise}
      />,
    )

    const input = screen.getByRole('textbox')
    await userEvent.click(input)
    await userEvent.click(getCurrentMonthDay('5')!)

    expect(screen.getByRole('dialog', { name: 'Calendar' })).toBeInTheDocument()
    expect(screen.getByText('Validating selection...')).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()

    deferred.resolve({ valid: false, message: 'Date is no longer available.' })

    await screen.findByText('Date is no longer available.')
    expect(screen.getByRole('dialog', { name: 'Calendar' })).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports optimistic async validation for plus datepicker with uncontrolled rollback on failure', async () => {
    const onChange = vi.fn()
    const deferred = createDeferred<AsyncValidationResult>()

    render(
      <DatePicker
        onChange={onChange}
        validateAsync={() => deferred.promise}
        validationBehavior="optimistic"
      />,
    )

    const input = screen.getByRole('textbox')
    await userEvent.click(input)
    await userEvent.click(getCurrentMonthDay('5')!)

    expect(onChange).toHaveBeenCalledWith(expect.any(Date))
    expect(input).toHaveValue(format(new Date(2024, 0, 5), 'PPP'))

    deferred.resolve({ valid: false, message: 'Server rejected that date.' })

    await screen.findByText('Server rejected that date.')
    expect(input).toHaveValue('')
  })

  it('applies dark theme mode and popover skin overrides to the portaled calendar', async () => {
    render(
      <DatePicker
        theme="dark"
        skin={{ popoverShellClassName: 'picker-skin-shell' }}
      />,
    )

    await userEvent.click(screen.getByRole('textbox'))

    const dialog = await screen.findByRole('dialog', { name: 'Calendar' })
    expect(dialog).toHaveAttribute('data-rdp-theme', 'dark')
    expect(dialog).toHaveClass('dark')
    expect(dialog).toHaveClass('picker-skin-shell')
  })

  it('supports the built-in material theme preset', async () => {
    render(<DatePicker theme="material-light" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('rounded-full')

    await userEvent.click(input)

    const dialog = await screen.findByRole('dialog', { name: 'Calendar' })
    expect(dialog).toHaveAttribute('data-rdp-theme', 'material-light')
    expect(dialog.firstElementChild).toHaveClass('rounded-[32px]')
  })

  it('supports the built-in modern minimal theme preset', async () => {
    render(<DatePicker theme="modern-minimal-light" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('rounded-2xl')

    await userEvent.click(input)

    const dialog = await screen.findByRole('dialog', { name: 'Calendar' })
    expect(dialog).toHaveAttribute('data-rdp-theme', 'modern-minimal-light')
    expect(dialog.firstElementChild).toHaveClass('rounded-2xl')
  })

  it('supports the built-in booking theme preset', async () => {
    render(<DatePicker theme="booking-light" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('rounded-xl')

    await userEvent.click(input)

    const dialog = await screen.findByRole('dialog', { name: 'Calendar' })
    expect(dialog).toHaveAttribute('data-rdp-theme', 'booking-light')
    expect(dialog.firstElementChild).toHaveClass('rounded-2xl')
  })

  it('keeps the popover mounted briefly for fluent exit animations', async () => {
    render(<DatePicker skin={fluentAnimationPack.datePicker} />)

    const input = screen.getByRole('textbox')
    await userEvent.click(input)

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Calendar' })).toHaveAttribute('data-state', 'open')
    })

    await userEvent.click(input)

    expect(screen.getByRole('dialog', { name: 'Calendar' })).toHaveAttribute('data-state', 'closed')

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Calendar' })).not.toBeInTheDocument()
    })
  })
})
