import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Calendar from './Calendar'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (dayLabel: string) =>
  screen
    .getAllByRole('gridcell')
    .find(
      button =>
        button.textContent === dayLabel
        && !button.classList.contains('text-[var(--rdp-muted-foreground)]'),
    )

describe('Plus Calendar', () => {
  beforeEach(() => vi.setSystemTime(jan102024))

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('supports uncontrolled selection', async () => {
    render(<Calendar />)

    const day15 = getCurrentMonthDay('15')
    expect(day15).toBeDefined()

    await userEvent.click(day15!)

    expect(day15).toHaveClass('bg-[var(--rdp-accent)]')
  })

  it('supports built-in plus theme presets', () => {
    render(<Calendar theme="material-light" />)

    const grid = screen.getByRole('grid')
    expect(grid).toHaveAttribute('data-rdp-theme', 'material-light')
    expect(grid).toHaveClass('rounded-[28px]')
  })

  it('supports plus skin overrides', () => {
    render(<Calendar theme="dark" skin={{ containerClassName: 'plus-calendar-skin' }} />)

    const grid = screen.getByRole('grid')
    expect(grid).toHaveAttribute('data-rdp-theme', 'dark')
    expect(grid.parentElement).toHaveClass('dark')
    expect(grid).toHaveClass('plus-calendar-skin')
  })
})
