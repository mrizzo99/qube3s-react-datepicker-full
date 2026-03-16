import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DatePicker from './DatePicker'
import { createDateValidationAdapter } from '../../testing/asyncValidationHttp'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (label: string) =>
  screen
    .getAllByRole('gridcell')
    .find(
      button =>
        button.textContent === label
        && !button.classList.contains('text-[var(--rdp-muted-foreground)]'),
    )

describe('Plus DatePicker browser async validation', () => {
  beforeEach(() => {
    vi.setSystemTime(jan102024)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    cleanup()
  })

  it('submits the selected date through fetch and keeps the calendar open on a server rejection', async () => {
    const requests: Array<{ url: string; body: string | undefined }> = []
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : input.toString()
      requests.push({ url, body: init?.body?.toString() })

      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Date is no longer available.',
          code: 'DATE_UNAVAILABLE',
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    })

    render(<DatePicker validateAsync={createDateValidationAdapter('/api/validate-date')} />)

    await userEvent.click(screen.getByRole('textbox'))
    await userEvent.click(getCurrentMonthDay('7')!)

    expect(await screen.findByText('Date is no longer available.')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Calendar' })).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    expect(requests).toHaveLength(1)
    expect(requests[0]?.url).toBe('/api/validate-date')
    expect(JSON.parse(requests[0]?.body ?? '{}')).toEqual({
      date: new Date(2024, 0, 7).toISOString(),
    })
  })
})
