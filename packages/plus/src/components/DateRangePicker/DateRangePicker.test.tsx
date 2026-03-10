import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { format } from 'date-fns'
import DateRangePicker from './DateRangePicker'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (label: string) =>
  screen
    .getAllByRole('gridcell')
    .find(button => button.textContent === label && !button.classList.contains('text-gray-300'))

describe('DateRangePicker', () => {
  beforeEach(() => vi.setSystemTime(jan102024))

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('supports the compound structure for selecting a range', async () => {
    const onChange = vi.fn()

    render(
      <DateRangePicker onChange={onChange}>
        <DateRangePicker.Input />
        <DateRangePicker.Calendar>
          <DateRangePicker.CalendarHeader />
          <DateRangePicker.CalendarGrid />
        </DateRangePicker.Calendar>
      </DateRangePicker>,
    )

    const startInput = screen.getByPlaceholderText('Start date')
    const endInput = screen.getByPlaceholderText('End date')

    await userEvent.click(startInput)

    const day5 = getCurrentMonthDay('5')!
    const day7 = getCurrentMonthDay('7')!
    await userEvent.click(day5)
    await userEvent.click(day7)

    expect(onChange).toHaveBeenCalledTimes(2)
    expect(startInput).toHaveValue(format(new Date(2024, 0, 5), 'PPP'))
    expect(endInput).toHaveValue(format(new Date(2024, 0, 7), 'PPP'))
  })

  it('shows one month by default and supports two/three-month layouts', async () => {
    const { rerender } = render(<DateRangePicker />)
    const startInput = screen.getByPlaceholderText('Start date')

    await userEvent.click(startInput)
    expect(screen.getAllByText('January 2024').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('February 2024')).not.toBeInTheDocument()

    rerender(<DateRangePicker numberOfMonths={2} />)
    expect(screen.getByText('January 2024')).toBeInTheDocument()
    expect(screen.getByText('February 2024')).toBeInTheDocument()

    rerender(<DateRangePicker numberOfMonths={3} />)
    expect(screen.getByText('January 2024')).toBeInTheDocument()
    expect(screen.getByText('February 2024')).toBeInTheDocument()
    expect(screen.getByText('March 2024')).toBeInTheDocument()
  })

  it('positions portal popover near the trigger and auto-scrolls when clipped', async () => {
    const originalScrollBy = window.scrollBy
    const scrollBySpy = vi.fn()
    window.scrollBy = scrollBySpy
    const originalBodyPadding = document.body.style.paddingBottom

    const originalInnerHeight = window.innerHeight
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })

    const rectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function getRect() {
        const className = typeof this.className === 'string' ? this.className : ''
        if (this.getAttribute('role') === 'dialog') {
          return {
            x: 64,
            y: 168,
            width: 640,
            height: 360,
            top: 168,
            left: 64,
            right: 704,
            bottom: 980,
            toJSON: () => ({}),
          } as DOMRect
        }

        if (className.includes('relative inline-flex flex-col gap-2')) {
          return {
            x: 64,
            y: 120,
            width: 420,
            height: 40,
            top: 120,
            left: 64,
            right: 484,
            bottom: 160,
            toJSON: () => ({}),
          } as DOMRect
        }

        return {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          toJSON: () => ({}),
        } as DOMRect
      })

    render(<DateRangePicker numberOfMonths={3} />)

    await userEvent.click(screen.getByPlaceholderText('Start date'))

    const dialog = await screen.findByRole('dialog', { name: 'Range calendar' })
    expect(dialog.style.left).toBe('64px')
    expect(dialog.style.top).toBe('168px')

    await waitFor(() => {
      expect(scrollBySpy).toHaveBeenCalledWith(
        expect.objectContaining({ top: expect.any(Number), behavior: 'smooth' }),
      )
    })

    await userEvent.click(screen.getByPlaceholderText('Start date'))
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Range calendar' })).not.toBeInTheDocument()
    })
    expect(document.body.style.paddingBottom).toBe(originalBodyPadding)

    rectSpy.mockRestore()
    window.scrollBy = originalScrollBy
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true })
  })

  it('supports year navigation controls in popover header', async () => {
    render(<DateRangePicker />)
    await userEvent.click(screen.getByPlaceholderText('Start date'))

    await userEvent.click(screen.getByRole('button', { name: 'Next year' }))
    expect(screen.getByRole('grid', { name: 'January 2025' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Previous year' }))
    expect(screen.getByRole('grid', { name: 'January 2024' })).toBeInTheDocument()
  })

  it('supports selecting quick preset ranges', async () => {
    const onChange = vi.fn()

    render(<DateRangePicker onChange={onChange} showPresets />)
    await userEvent.click(screen.getByPlaceholderText('Start date'))

    await userEvent.click(screen.getByRole('button', { name: 'Last 7 days' }))

    const startInput = screen.getByPlaceholderText('Start date')
    const endInput = screen.getByPlaceholderText('End date')
    expect(startInput).toHaveValue(format(new Date(2024, 0, 4), 'PPP'))
    expect(endInput).toHaveValue(format(new Date(2024, 0, 10), 'PPP'))
    expect(onChange).toHaveBeenCalledWith({
      start: new Date(2024, 0, 4),
      end: new Date(2024, 0, 10),
    })
  })
})
