import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DateRangePicker from './DateRangePicker'
import { createRangeValidationAdapter } from '../../testing/asyncValidationHttp'

const jan102024 = new Date('2024-01-10T12:00:00Z')

const getCurrentMonthDay = (label: string) =>
  screen
    .getAllByRole('gridcell')
    .find(button => button.textContent === label && !button.classList.contains('text-gray-300'))

describe('DateRangePicker browser async validation', () => {
  beforeEach(() => {
    vi.setSystemTime(jan102024)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
    cleanup()
  })

  it('submits a completed range through fetch and surfaces a server rejection inline', async () => {
    const requests: Array<{ url: string; body: string | undefined }> = []
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : input.toString()
      requests.push({ url, body: init?.body?.toString() })

      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Selected range is not available.',
          code: 'RANGE_UNAVAILABLE',
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    })

    render(
      <DateRangePicker validateAsync={createRangeValidationAdapter('/api/validate-range')} />,
    )

    await userEvent.click(screen.getByPlaceholderText('Start date'))
    await userEvent.click(getCurrentMonthDay('5')!)
    await userEvent.click(getCurrentMonthDay('7')!)

    expect(await screen.findByText('Selected range is not available.')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Range calendar' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByPlaceholderText('End date')).toHaveValue('')
    })
    expect(requests).toHaveLength(1)
    expect(requests[0]?.url).toBe('/api/validate-range')
    expect(JSON.parse(requests[0]?.body ?? '{}')).toEqual({
      start: new Date(2024, 0, 5).toISOString(),
      end: new Date(2024, 0, 7).toISOString(),
    })
  })
})
