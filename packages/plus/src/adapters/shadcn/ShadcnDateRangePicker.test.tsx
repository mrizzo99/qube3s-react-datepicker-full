import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import ShadcnDateRangePicker from './ShadcnDateRangePicker'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (label: string) =>
  screen
    .getAllByRole('gridcell')
    .find(button => button.textContent === label)

describe('ShadcnDateRangePicker adapter', () => {
  beforeEach(() => vi.setSystemTime(jan102024))

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('renders range inputs and calendar with shadcn slots', async () => {
    render(<ShadcnDateRangePicker showPresets enableTime />)

    const inputs = screen.getAllByRole('textbox')
    expect(inputs[0].className).toContain('border-input')
    expect(inputs[1].className).toContain('border-input')

    await userEvent.click(inputs[0])

    const dialog = screen.getByRole('dialog', { name: 'Range calendar' })
    expect(dialog.className).toContain('bg-popover')
    expect(screen.getByRole('button', { name: 'Next month' }).className).toContain('rounded-md')

    const preset = screen.getByRole('button', { name: 'Today' })
    expect(preset.className).toContain('border')

    await userEvent.click(getCurrentMonthDay('10')!)
    await userEvent.click(getCurrentMonthDay('12')!)
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(inputs[0]).toHaveValue('January 10th, 2024 09:00 AM')
    expect(inputs[1]).toHaveValue('January 12th, 2024 05:00 PM')
  })
})
