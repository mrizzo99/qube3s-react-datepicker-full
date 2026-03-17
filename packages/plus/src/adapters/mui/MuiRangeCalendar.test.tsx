import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import MuiRangeCalendar from './MuiRangeCalendar'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (label: string) =>
  screen
    .getAllByRole('gridcell')
    .find(button => button.textContent === label)

describe('MuiRangeCalendar adapter', () => {
  beforeEach(() => vi.setSystemTime(jan102024))

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('renders mui range calendar styling and supports range selection', async () => {
    const onChange = vi.fn()

    render(<MuiRangeCalendar selectRange={onChange} showPresets numberOfMonths={2} />)

    const grid = screen.getByRole('grid', { name: 'January 2024 - February 2024' })
    expect(grid.className).toContain('MuiPaper-root')
    const sundayHeader = screen.getAllByText('Su')[0]
    expect(sundayHeader.parentElement?.className ?? '').toContain('gap-1')
    expect(sundayHeader.className).toContain('MuiTypography-caption')
    expect(grid.innerHTML).toContain('MuiPickersDay-root')

    const preset = screen.getByRole('button', { name: 'Today' })
    expect(preset.className).toContain('MuiChip-root')

    const day10 = getCurrentMonthDay('10')!
    const day12 = getCurrentMonthDay('12')!
    expect(day10.className).toContain('rounded-full')
    expect(day10.parentElement?.className ?? '').toContain('grid-cols-7')
    expect(day10.parentElement?.className ?? '').toContain('gap-1')

    await userEvent.click(day10)
    await userEvent.click(day12)

    expect(onChange).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Next month' }).className).toContain('MuiIconButton-root')
  })
})
