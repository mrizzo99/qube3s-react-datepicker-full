import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import MuiCalendar from './MuiCalendar'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (label: string) =>
  screen
    .getAllByRole('gridcell')
    .find(button => button.textContent === label)

describe('MuiCalendar adapter', () => {
  beforeEach(() => vi.setSystemTime(jan102024))

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('covers the core inline calendar with mui styling', async () => {
    const onSelect = vi.fn()

    render(<MuiCalendar selectDate={onSelect} />)

    const grid = screen.getByRole('grid', { name: 'January 2024' })
    expect(grid.className).toContain('MuiPaper-root')
    expect(screen.getByRole('button', { name: 'Next month' }).className).toContain('MuiIconButton-root')
    expect(screen.getByText('Su').className).toContain('MuiTypography-caption')

    const day15 = getCurrentMonthDay('15')!
    await userEvent.click(day15)

    expect(onSelect).toHaveBeenCalledWith(expect.any(Date))
    expect(day15.className).toContain('MuiPickersDay-root')
    expect(day15.className).toContain('rounded-full')
  })
})
