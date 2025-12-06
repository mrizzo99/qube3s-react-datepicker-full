import React from "react";
import {cleanup, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {vi, describe, it, expect, beforeEach, afterEach} from "vitest";
import {format} from 'date-fns';
import Calendar from "./Calendar";

const jan102024 = new Date('2024-01-10T12:00:00Z') // stable base date
const expectDayGrid = () =>
  screen.getAllByRole('button', { name: /^[0-9]+$/ }) // excludes the nav arrows
const getCurrentMonthDay = (dayLabel: string) =>
  screen.getAllByRole('button', { name: dayLabel }).find(btn => !btn.classList.contains('text-gray-300'))
const expectHasClass = (el: HTMLElement, className: string) => expect(el.className.split(' ')).toContain(className)

describe('Calendar', () => {
  beforeEach(() => vi.setSystemTime(jan102024))
  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('renders the current month label and 6x7 grid', () => {
    render(<Calendar />)
    expect(screen.getByText(format(jan102024, 'MMMM yyyy'))).toBeInTheDocument()
    expect(expectDayGrid().length).toBeGreaterThanOrEqual(35) // 5 or 6 rows depending on month layout
  })

  it('navigates months with prev/next', async () => {
    render(<Calendar />)
    await userEvent.click(screen.getAllByRole('button', { name: '→' })[0])
    expect(screen.getByText('February 2024')).toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('button', { name: '←' })[0])
    expect(screen.getByText('January 2024')).toBeInTheDocument()
  })

  it('highlights uncontrolled selection on click', async () => {
    render(<Calendar />)
    const day15 = getCurrentMonthDay('15')!
    await userEvent.click(day15)
    expect(day15).toHaveClass('bg-blue-600')
  })

  it('respects controlled selectedDate/selectDate', async () => {
    const onSelect = vi.fn()
    render(<Calendar selectedDate={new Date(2024, 0, 5)} selectDate={onSelect} />)
    const day5 = getCurrentMonthDay('5')!
    expect(day5).toHaveClass('bg-blue-600')
    const day6 = getCurrentMonthDay('6')!
    await userEvent.click(day6)
    expect(onSelect).toHaveBeenCalledWith(expect.any(Date))
  })

  it('fades days outside the current month', () => {
    render(<Calendar />)
    const grid = expectDayGrid()
    const first = grid[0]
    // First cell should be late December 2023 when base date is Jan 2024
    expect(first).toHaveClass('text-gray-300')
  })
})
