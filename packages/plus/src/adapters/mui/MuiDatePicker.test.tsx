import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { format } from 'date-fns'
import MuiDatePicker from './MuiDatePicker'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (label: string) =>
  screen
    .getAllByRole('gridcell')
    .find(button => button.textContent === label)

describe('MuiDatePicker adapter', () => {
  beforeEach(() => vi.setSystemTime(jan102024))

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('preserves plus constraints while rendering mui-style slots', async () => {
    const onChange = vi.fn()

    render(
      <MuiDatePicker
        onChange={onChange}
        minDate={new Date(2024, 0, 5)}
        maxDate={new Date(2024, 0, 20)}
        blockWeekends
      />,
    )

    const input = screen.getByRole('textbox')
    expect(input.className).toContain('MuiInputBase-input')
    expect(screen.getByRole('button', { name: 'Open calendar' }).className).toContain('MuiIconButton-root')

    await userEvent.click(input)

    const dialog = screen.getByRole('dialog', { name: 'Calendar' })
    expect(dialog.className).toContain('MuiPopover-root')
    expect(dialog.innerHTML).toContain('MuiPopover-paper')
    expect(screen.getByRole('button', { name: 'Next month' }).className).toContain('MuiIconButton-root')

    const day4 = getCurrentMonthDay('4')!
    const day5 = getCurrentMonthDay('5')!
    const day6 = getCurrentMonthDay('6')!

    expect(day4).toHaveAttribute('aria-disabled', 'true')
    expect(day5).toHaveAttribute('aria-disabled', 'false')
    expect(day6).toHaveAttribute('aria-disabled', 'true')

    await userEvent.click(day5)

    expect(onChange).toHaveBeenCalledWith(expect.any(Date))
    expect(input).toHaveValue(format(new Date(2024, 0, 5), 'PPP'))
  })

  it('ignores stock theme and skin props at runtime', async () => {
    const runtimeOnlyProps: Record<string, unknown> = {
      theme: 'dark',
      skin: { popoverShellClassName: 'should-not-apply' },
    }

    render(
      <MuiDatePicker {...runtimeOnlyProps} />,
    )

    await userEvent.click(screen.getByRole('textbox'))

    const dialog = screen.getByRole('dialog', { name: 'Calendar' })
    expect(dialog).not.toHaveAttribute('data-rdp-theme')
    expect(dialog.className).not.toContain('should-not-apply')
  })
})
