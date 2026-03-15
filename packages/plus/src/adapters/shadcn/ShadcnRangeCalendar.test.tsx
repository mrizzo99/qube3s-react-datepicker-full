import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import ShadcnRangeCalendar from './ShadcnRangeCalendar'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (label: string) =>
  screen
    .getAllByRole('gridcell')
    .find(button => button.textContent === label)

describe('ShadcnRangeCalendar adapter', () => {
  beforeEach(() => vi.setSystemTime(jan102024))

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('renders shadcn range calendar styling and supports range selection', async () => {
    const onChange = vi.fn()

    render(<ShadcnRangeCalendar selectRange={onChange} showPresets />)

    const grid = screen.getByRole('grid', { name: 'January 2024' })
    expect(grid.className).toContain('bg-popover')

    const preset = screen.getByRole('button', { name: 'Today' })
    expect(preset.className).toContain('rounded-md')

    await userEvent.click(getCurrentMonthDay('10')!)
    await userEvent.click(getCurrentMonthDay('12')!)

    expect(onChange).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Next month' }).className).toContain('rounded-md')
  })
})
