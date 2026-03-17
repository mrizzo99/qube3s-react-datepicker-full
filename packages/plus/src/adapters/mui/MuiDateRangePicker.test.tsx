import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import MuiDateRangePicker from './MuiDateRangePicker'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (label: string) =>
  screen
    .getAllByRole('gridcell')
    .find(button => button.textContent === label)

describe('MuiDateRangePicker adapter', () => {
  beforeEach(() => vi.setSystemTime(jan102024))

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('renders range inputs and calendar with mui slots', async () => {
    render(<MuiDateRangePicker showPresets enableTime numberOfMonths={2} />)

    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0].className).toContain('MuiInputBase-input')
    expect(inputs[1].className).toContain('MuiInputBase-input')

    await userEvent.click(inputs[0])

    const dialog = screen.getByRole('dialog', { name: 'Range calendar' })
    expect(dialog.className).toContain('MuiPopover-root')
    expect(screen.getAllByRole('row').some(row => row.className.includes('grid-cols-7'))).toBe(true)
    expect(screen.getByRole('button', { name: 'Next month' }).className).toContain('MuiIconButton-root')

    const preset = screen.getByRole('button', { name: 'Today' })
    expect(preset.className).toContain('MuiChip-root')

    await userEvent.click(getCurrentMonthDay('10')!)
    await userEvent.click(getCurrentMonthDay('12')!)
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(inputs[0]).toHaveValue('January 10th, 2024 09:00 AM')
    expect(inputs[1]).toHaveValue('January 12th, 2024 05:00 PM')
  })

  it('ignores stock theme and skin props at runtime', async () => {
    const runtimeOnlyProps: Record<string, unknown> = {
      theme: 'dark',
      skin: { desktopPopoverShellClassName: 'should-not-apply' },
    }

    render(
      <MuiDateRangePicker {...runtimeOnlyProps} />,
    )

    await userEvent.click(screen.getAllByRole('textbox')[0])

    const dialog = screen.getByRole('dialog', { name: 'Range calendar' })
    expect(dialog).not.toHaveAttribute('data-rdp-theme')
    expect(dialog.className).not.toContain('should-not-apply')
  })
})
