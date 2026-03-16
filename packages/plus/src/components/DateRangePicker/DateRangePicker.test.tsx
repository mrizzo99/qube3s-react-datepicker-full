import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { format } from 'date-fns'
import type { AsyncValidationResult } from '@core/asyncValidation'
import DateRangePicker from './DateRangePicker'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const getCurrentMonthDay = (label: string) =>
  screen
    .getAllByRole('gridcell')
    .find(button => button.textContent === label && !button.classList.contains('text-gray-300'))
const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

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
      .mockImplementation(function getRect(this: HTMLElement) {
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

  it('renders a bottom-sheet calendar when mobile mode is always enabled', async () => {
    const originalBodyOverflow = document.body.style.overflow

    render(<DateRangePicker mobile={{ enabled: true, mode: 'always' }} />)

    await userEvent.click(screen.getByPlaceholderText('Start date'))

    const dialog = await screen.findByRole('dialog', { name: 'Range calendar' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog.className).toContain('rounded-t-2xl')
    expect(document.body.style.overflow).toBe('hidden')

    await userEvent.click(screen.getByRole('button', { name: 'Close range calendar' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Range calendar' })).not.toBeInTheDocument()
    })
    expect(document.body.style.overflow).toBe(originalBodyOverflow)
  })

  it('supports swipe month navigation in mobile sheet mode', async () => {
    render(
      <DateRangePicker
        mobile={{ enabled: true, mode: 'always', gestures: { swipeMonth: true } }}
      />,
    )

    await userEvent.click(screen.getByPlaceholderText('Start date'))
    expect(screen.getByRole('grid', { name: 'January 2024' })).toBeInTheDocument()

    const monthViewport = screen.getByTestId('range-month-viewport')
    fireEvent.pointerDown(monthViewport, { clientX: 240, clientY: 120 })
    fireEvent.pointerUp(monthViewport, { clientX: 140, clientY: 126 })

    expect(screen.getByRole('grid', { name: 'February 2024' })).toBeInTheDocument()
  })

  it('supports swipe down to close in mobile sheet mode', async () => {
    render(
      <DateRangePicker
        mobile={{ enabled: true, mode: 'always', gestures: { swipeToClose: true } }}
      />,
    )

    await userEvent.click(screen.getByPlaceholderText('Start date'))
    await screen.findByRole('dialog', { name: 'Range calendar' })

    const handle = screen.getByTestId('range-sheet-handle')
    fireEvent.pointerDown(handle, { clientX: 120, clientY: 24 })
    fireEvent.pointerUp(handle, { clientX: 126, clientY: 116 })

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Range calendar' })).not.toBeInTheDocument()
    })
  })

  it('keeps the mobile sheet open when drag distance is below the close threshold', async () => {
    render(
      <DateRangePicker
        mobile={{ enabled: true, mode: 'always', gestures: { swipeToClose: true } }}
      />,
    )

    await userEvent.click(screen.getByPlaceholderText('Start date'))
    const dialog = await screen.findByRole('dialog', { name: 'Range calendar' })

    const handle = screen.getByTestId('range-sheet-handle')
    fireEvent.pointerDown(handle, { clientX: 120, clientY: 24 })
    fireEvent.pointerMove(handle, { clientX: 122, clientY: 56 })
    fireEvent.pointerUp(handle, { clientX: 122, clientY: 56 })

    expect(dialog).toBeInTheDocument()
  })

  it('supports year navigation controls in popover header', async () => {
    render(<DateRangePicker />)
    await userEvent.click(screen.getByPlaceholderText('Start date'))

    await userEvent.click(screen.getByRole('button', { name: 'Next year' }))
    expect(screen.getByRole('grid', { name: 'January 2025' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Previous year' }))
    expect(screen.getByRole('grid', { name: 'January 2024' })).toBeInTheDocument()
  })

  it('opens the calendar from either input using keyboard keys', async () => {
    const firstRender = render(<DateRangePicker />)
    const startInput = screen.getByPlaceholderText('Start date')

    startInput.focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(await screen.findByRole('dialog', { name: 'Range calendar' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('grid', { name: 'January 2024' })).toHaveFocus())

    await userEvent.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Range calendar' })).not.toBeInTheDocument()
    })

    firstRender.unmount()
    const secondRender = render(<DateRangePicker />)
    const endInput = screen.getByPlaceholderText('End date')
    endInput.focus()
    await userEvent.keyboard('{Enter}')
    expect(await screen.findByRole('dialog', { name: 'Range calendar' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('grid', { name: 'January 2024' })).toHaveFocus())

    await userEvent.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Range calendar' })).not.toBeInTheDocument()
    })

    secondRender.unmount()
    render(<DateRangePicker />)
    const endInputAfterRemount = screen.getByPlaceholderText('End date')
    endInputAfterRemount.focus()
    await userEvent.keyboard(' ')
    expect(await screen.findByRole('dialog', { name: 'Range calendar' })).toBeInTheDocument()
  })

  it('traps focus and handles Escape at dialog level', async () => {
    render(<DateRangePicker />)
    const startInput = screen.getByPlaceholderText('Start date')
    await userEvent.click(startInput)

    const dialog = await screen.findByRole('dialog', { name: 'Range calendar' })
    const grid = screen.getByRole('grid', { name: 'January 2024' })
    await waitFor(() => expect(grid).toHaveFocus())

    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
    expect(focusable.length).toBeGreaterThan(1)
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    last.focus()
    await userEvent.tab()
    expect(first).toHaveFocus()

    first.focus()
    await userEvent.tab({ shift: true })
    expect(last).toHaveFocus()

    screen.getByRole('button', { name: 'Next month' }).focus()
    await userEvent.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Range calendar' })).not.toBeInTheDocument()
    })
    expect(startInput).toHaveFocus()
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

  it('keeps the range calendar open while blocking async validation is pending and shows errors for rejected ranges', async () => {
    const onChange = vi.fn()
    const deferred = createDeferred<AsyncValidationResult>()

    render(
      <DateRangePicker
        onChange={onChange}
        validateAsync={() => deferred.promise}
      />,
    )

    await userEvent.click(screen.getByPlaceholderText('Start date'))
    await userEvent.click(getCurrentMonthDay('5')!)
    await userEvent.click(getCurrentMonthDay('7')!)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog', { name: 'Range calendar' })).toBeInTheDocument()
    expect(screen.getByText('Validating selection...')).toBeInTheDocument()

    deferred.resolve({ valid: false, message: 'Selected range is not available.' })

    await waitFor(() => {
      expect(screen.getByText('Selected range is not available.')).toBeInTheDocument()
    })
    expect(screen.getByRole('dialog', { name: 'Range calendar' })).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(screen.getByPlaceholderText('End date')).toHaveValue('')
  })

  it('supports optimistic async validation with uncontrolled rollback on failed range validation', async () => {
    const onChange = vi.fn()
    const deferred = createDeferred<AsyncValidationResult>()

    render(
      <DateRangePicker
        onChange={onChange}
        validateAsync={() => deferred.promise}
        validationBehavior="optimistic"
      />,
    )

    await userEvent.click(screen.getByPlaceholderText('Start date'))
    await userEvent.click(getCurrentMonthDay('5')!)
    await userEvent.click(getCurrentMonthDay('7')!)

    expect(onChange).toHaveBeenCalledTimes(2)
    expect(screen.getByPlaceholderText('Start date')).toHaveValue(format(new Date(2024, 0, 5), 'PPP'))
    expect(screen.getByPlaceholderText('End date')).toHaveValue(format(new Date(2024, 0, 7), 'PPP'))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Range calendar' })).not.toBeInTheDocument()
    })

    deferred.resolve({ valid: false, message: 'Server rejected that range.' })

    await waitFor(() => {
      expect(screen.getByText('Server rejected that range.')).toBeInTheDocument()
    })
    expect(screen.getByPlaceholderText('Start date')).toHaveValue(format(new Date(2024, 0, 5), 'PPP'))
    expect(screen.getByPlaceholderText('End date')).toHaveValue('')
  })

  it('applies default times and date-time formatting when time is enabled', async () => {
    const onChange = vi.fn()

    render(
      <DateRangePicker
        onChange={onChange}
        enableTime
        timeFormat="24h"
        defaultStartTime="08:30"
        defaultEndTime="17:45"
      />,
    )

    const startInput = screen.getByPlaceholderText('Start date')
    const endInput = screen.getByPlaceholderText('End date')

    await userEvent.click(startInput)

    const day5 = getCurrentMonthDay('5')!
    const day7 = getCurrentMonthDay('7')!
    await userEvent.click(day5)
    await userEvent.click(day7)

    expect(onChange).not.toHaveBeenCalled()
    expect(startInput).toHaveValue('')
    expect(endInput).toHaveValue('')

    await userEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(startInput).toHaveValue(format(new Date(2024, 0, 5, 8, 30), 'PPP HH:mm'))
    expect(endInput).toHaveValue(format(new Date(2024, 0, 7, 17, 45), 'PPP HH:mm'))
    expect(onChange).toHaveBeenLastCalledWith({
      start: new Date(2024, 0, 5, 8, 30),
      end: new Date(2024, 0, 7, 17, 45),
    })
  })

  it('updates selected range time from wheel controls', async () => {
    const onChange = vi.fn()

    render(
      <DateRangePicker
        onChange={onChange}
        enableTime
        timeFormat="24h"
        defaultStartTime="08:00"
        defaultEndTime="17:00"
      />,
    )

    const startInput = screen.getByPlaceholderText('Start date')
    await userEvent.click(startInput)

    const day5 = getCurrentMonthDay('5')!
    const day7 = getCurrentMonthDay('7')!
    await userEvent.click(day5)
    await userEvent.click(day7)

    await userEvent.click(screen.getByRole('option', { name: 'Start hour - Set hour to 10' }))
    await userEvent.click(screen.getByRole('option', { name: 'Start minute - Set minutes to 15' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(startInput).toHaveValue('')

    await userEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(onChange).toHaveBeenLastCalledWith({
      start: new Date(2024, 0, 5, 10, 15),
      end: new Date(2024, 0, 7, 17, 0),
    })

    expect(startInput).toHaveValue(format(new Date(2024, 0, 5, 10, 15), 'PPP HH:mm'))
  })

  it('supports keyboard navigation for time wheel listboxes', async () => {
    render(
      <DateRangePicker
        enableTime
        timeFormat="24h"
        defaultStartTime="08:00"
        defaultEndTime="17:00"
      />,
    )

    const startInput = screen.getByPlaceholderText('Start date')
    await userEvent.click(startInput)

    const day5 = getCurrentMonthDay('5')!
    const day7 = getCurrentMonthDay('7')!
    await userEvent.click(day5)
    await userEvent.click(day7)

    const startHourListbox = screen.getByRole('listbox', { name: 'Start hour' })
    startHourListbox.focus()
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{PageDown}')

    const startMinuteListbox = screen.getByRole('listbox', { name: 'Start minute' })
    startMinuteListbox.focus()
    await userEvent.keyboard('{End}')

    expect(startHourListbox).toHaveAttribute('aria-activedescendant')
    expect(screen.getByRole('option', { selected: true, name: 'Start hour - Set hour to 14' })).toBeInTheDocument()
    expect(startInput).toHaveValue('')
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(startInput).toHaveValue(format(new Date(2024, 0, 5, 14, 59), 'PPP HH:mm'))
  })

  it('cancels time-enabled edits without committing the input values', async () => {
    const onChange = vi.fn()
    render(
      <DateRangePicker
        onChange={onChange}
        enableTime
        timeFormat="24h"
        defaultStartTime="08:00"
        defaultEndTime="17:00"
      />,
    )

    const startInput = screen.getByPlaceholderText('Start date')
    const endInput = screen.getByPlaceholderText('End date')
    await userEvent.click(startInput)

    const day5 = getCurrentMonthDay('5')!
    const day7 = getCurrentMonthDay('7')!
    await userEvent.click(day5)
    await userEvent.click(day7)
    await userEvent.click(screen.getByRole('option', { name: 'Start minute - Set minutes to 15' }))

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Range calendar' })).not.toBeInTheDocument()
    })
    expect(onChange).not.toHaveBeenCalled()
    expect(startInput).toHaveValue('')
    expect(endInput).toHaveValue('')
    expect(startInput).toHaveFocus()
  })

  it('applies dark theme mode and shell skin overrides to the portaled range calendar', async () => {
    render(
      <DateRangePicker
        theme="dark"
        skin={{ desktopPopoverShellClassName: 'range-picker-skin-shell' }}
      />,
    )

    await userEvent.click(screen.getByPlaceholderText('Start date'))

    const dialog = await screen.findByRole('dialog', { name: 'Range calendar' })
    expect(dialog).toHaveAttribute('data-rdp-theme', 'dark')
    expect(dialog).toHaveClass('dark')
    expect(dialog).toHaveClass('range-picker-skin-shell')
  })

  it('supports the built-in material theme preset', async () => {
    render(<DateRangePicker theme="material-light" />)

    const input = screen.getByPlaceholderText('Start date')
    expect(input).toHaveClass('rounded-full')

    await userEvent.click(input)

    const dialog = await screen.findByRole('dialog', { name: 'Range calendar' })
    expect(dialog).toHaveAttribute('data-rdp-theme', 'material-light')
    expect(dialog.firstElementChild).toHaveClass('rounded-[32px]')
  })

  it('supports the built-in modern minimal theme preset', async () => {
    render(<DateRangePicker theme="modern-minimal-light" />)

    const input = screen.getByPlaceholderText('Start date')
    expect(input).toHaveClass('rounded-2xl')

    await userEvent.click(input)

    const dialog = await screen.findByRole('dialog', { name: 'Range calendar' })
    expect(dialog).toHaveAttribute('data-rdp-theme', 'modern-minimal-light')
    expect(dialog.firstElementChild).toHaveClass('rounded-2xl')
  })
})
