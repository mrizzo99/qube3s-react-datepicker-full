import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { format } from 'date-fns'
import DatePicker from './DatePicker'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (label: string) =>
  screen
    .getAllByRole('gridcell')
    .find(button => button.textContent === label && !button.classList.contains('text-gray-300'))

describe('DatePicker', () => {
  beforeEach(() => vi.setSystemTime(jan102024))

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  it('supports the compound structure for selecting a date', async () => {
    const onChange = vi.fn()

    render(
      <DatePicker onChange={onChange}>
        <DatePicker.Input />
        <DatePicker.Calendar>
          <DatePicker.CalendarHeader />
          <DatePicker.CalendarGrid />
        </DatePicker.Calendar>
      </DatePicker>,
    )

    const input = screen.getByRole('textbox')
    await userEvent.click(input)

    const day5 = getCurrentMonthDay('5')!
    await userEvent.click(day5)

    expect(onChange).toHaveBeenCalledWith(expect.any(Date))
    expect(input).toHaveValue(format(new Date(2024, 0, 5), 'PPP'))
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
            x: 48,
            y: 140,
            width: 288,
            height: 320,
            top: 140,
            left: 48,
            right: 336,
            bottom: 980,
            toJSON: () => ({}),
          } as DOMRect
        }

        if (className.includes('relative inline-flex items-center gap-1')) {
          return {
            x: 48,
            y: 96,
            width: 260,
            height: 36,
            top: 96,
            left: 48,
            right: 308,
            bottom: 132,
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

    render(<DatePicker />)

    await userEvent.click(screen.getByRole('textbox'))

    const dialog = await screen.findByRole('dialog', { name: 'Calendar' })
    expect(dialog.style.left).toBe('48px')
    expect(dialog.style.top).toBe('140px')

    await waitFor(() => {
      expect(scrollBySpy).toHaveBeenCalledWith(
        expect.objectContaining({ top: expect.any(Number), behavior: 'smooth' }),
      )
    })

    await userEvent.click(screen.getByRole('textbox'))
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Calendar' })).not.toBeInTheDocument()
    })
    expect(document.body.style.paddingBottom).toBe(originalBodyPadding)

    rectSpy.mockRestore()
    window.scrollBy = originalScrollBy
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true })
  })
})
