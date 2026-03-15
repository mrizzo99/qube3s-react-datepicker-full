import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
  createDateValidationAdapter,
  createRangeValidationAdapter,
  mapServerValidationResponse,
} from './asyncValidationHttp'

const observedRequests: Array<{ url: string; body: unknown }> = []
const dateValidationUrl = 'http://localhost/api/validate-date'
const rangeValidationUrl = 'http://localhost/api/validate-range'
const invalidJsonUrl = 'http://localhost/api/validate-date-invalid-json'
const networkErrorUrl = 'http://localhost/api/validate-date-network-error'

const server = setupServer(
  http.post(dateValidationUrl, async ({ request }) => {
    const body = await request.json()
    observedRequests.push({ url: '/api/validate-date', body })

    return HttpResponse.json({ valid: true })
  }),
  http.post(rangeValidationUrl, async ({ request }) => {
    const body = await request.json()
    observedRequests.push({ url: '/api/validate-range', body })

    return HttpResponse.json(
      {
        valid: false,
        message: 'Selected range is not available.',
        code: 'RANGE_UNAVAILABLE',
      },
      { status: 409 },
    )
  }),
  http.post(invalidJsonUrl, () => new HttpResponse('not json', { status: 200 })),
  http.post(networkErrorUrl, () => HttpResponse.error()),
)

describe('async validation HTTP adapters', () => {
  beforeAll(() => server.listen())
  afterEach(() => {
    observedRequests.length = 0
    server.resetHandlers()
  })
  afterAll(() => server.close())

  it('maps server responses into picker validation results', () => {
    expect(mapServerValidationResponse({ valid: true }, 'fallback')).toEqual({ valid: true })
    expect(
      mapServerValidationResponse(
        { valid: false, message: 'Date is blocked.', code: 'DATE_BLOCKED' },
        'fallback',
      ),
    ).toEqual({
      valid: false,
      message: 'Date is blocked.',
      code: 'DATE_BLOCKED',
    })
  })

  it('sends a date validation request with an ISO date payload', async () => {
    const validateDate = createDateValidationAdapter(dateValidationUrl)

    await expect(validateDate(new Date('2024-01-05T12:00:00Z'))).resolves.toEqual({ valid: true })
    expect(observedRequests).toEqual([
      {
        url: '/api/validate-date',
        body: { date: '2024-01-05T12:00:00.000Z' },
      },
    ])
  })

  it('sends a range validation request and returns the server error details', async () => {
    const validateRange = createRangeValidationAdapter(rangeValidationUrl)

    await expect(
      validateRange({
        start: new Date('2024-01-05T12:00:00Z'),
        end: new Date('2024-01-07T12:00:00Z'),
      }),
    ).resolves.toEqual({
      valid: false,
      message: 'Selected range is not available.',
      code: 'RANGE_UNAVAILABLE',
    })

    expect(observedRequests).toEqual([
      {
        url: '/api/validate-range',
        body: {
          start: '2024-01-05T12:00:00.000Z',
          end: '2024-01-07T12:00:00.000Z',
        },
      },
    ])
  })

  it('falls back to a default error when the server payload is invalid', async () => {
    const validateDate = createDateValidationAdapter(invalidJsonUrl)

    await expect(validateDate(new Date('2024-01-05T12:00:00Z'))).resolves.toEqual({
      valid: false,
      message: 'Date is not available.',
      code: 'INVALID_SERVER_RESPONSE',
    })
  })

  it('falls back to a default error when the request fails', async () => {
    const validateDate = createDateValidationAdapter(networkErrorUrl)

    await expect(validateDate(new Date('2024-01-05T12:00:00Z'))).resolves.toEqual({
      valid: false,
      message: 'Date is not available.',
      code: 'NETWORK_ERROR',
    })
  })
})
