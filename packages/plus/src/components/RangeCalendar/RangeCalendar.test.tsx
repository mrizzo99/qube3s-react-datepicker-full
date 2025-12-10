import React from "react";
import {cleanup, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {vi, describe, it, expect, beforeEach, afterEach} from "vitest";
import {format} from 'date-fns';
import RangeCalendar from "./RangeCalendar";

const jan102024 = new Date('2024-01-10T12:00:00Z') // stable base date
const expectDayGrid = () =>
  screen.getAllByRole('gridcell')
const getCurrentMonthDay = (dayLabel: string) =>
  screen.getAllByRole('gridcell').find(btn => btn.textContent === dayLabel && !btn.classList.contains('text-gray-300'))
const expectHasClass = (el: HTMLElement, className: string) => expect(el.className.split(' ')).toContain(className)

describe('RangeCalendar', () => {
  beforeEach(() => vi.setSystemTime(jan102024))
  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('renders the current month label and grid', () => {
    render(<RangeCalendar />)
    expect(screen.getByText(format(jan102024, 'MMMM yyyy'))).toBeInTheDocument()
    expect(expectDayGrid().length).toBeGreaterThanOrEqual(35)
  })

  it('navigates months before selection', async () => {
    render(<RangeCalendar />)
    expect(screen.getByText('January 2024')).toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('button', { name: '→' })[0])
    expect(screen.getByText('February 2024')).toBeInTheDocument()
  })

  it('selects a range', async () => {
    render(<RangeCalendar />)
    const day5 = getCurrentMonthDay('5')!
    const day7 = getCurrentMonthDay('7')!
    const day6 = getCurrentMonthDay('6')!

    await userEvent.click(day5)
    await userEvent.click(day7)

    expectHasClass(day5, 'bg-blue-600')
    expectHasClass(day7, 'bg-blue-600')
    expectHasClass(day6, 'bg-blue-100')
  })

  it('restarts range on third click', async () => {
    render(<RangeCalendar />)
    const day5 = getCurrentMonthDay('5')!
    const day7 = getCurrentMonthDay('7')!
    const day10 = getCurrentMonthDay('10')!

    await userEvent.click(day5)
    await userEvent.click(day7)
    await userEvent.click(day10)

    expectHasClass(day10, 'bg-blue-600')
    expect(day5.className).not.toContain('bg-blue-600')
  })

  it('supports controlled range', async () => {
    const onSelectRange = vi.fn()
    render(
      <RangeCalendar
        selectedRange={{ start: new Date(2024, 0, 5), end: new Date(2024, 0, 7) }}
        selectRange={onSelectRange}
      />
    )

    const day5 = getCurrentMonthDay('5')!
    const day6 = getCurrentMonthDay('6')!
    const day7 = getCurrentMonthDay('7')!
    const day10 = getCurrentMonthDay('10')!

    expectHasClass(day5, 'bg-blue-600')
    expectHasClass(day7, 'bg-blue-600')
    expectHasClass(day6, 'bg-blue-100')

    await userEvent.click(day10)
    expect(onSelectRange).toHaveBeenCalledWith({ start: new Date(2024, 0, 10), end: null })
  })

  it('supports keyboard navigation', async () => {
    render(<RangeCalendar />)
    const grid = screen.getByRole('grid')
    grid.focus()
    await userEvent.keyboard('{ArrowRight}')
    await userEvent.keyboard(' ')
    const selectedCells = await screen.findAllByRole('gridcell', { selected: true })
    expect(selectedCells.length).toBeGreaterThanOrEqual(1)
  })
})
