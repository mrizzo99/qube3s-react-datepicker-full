import type { AsyncValidationResult } from '@core/asyncValidation'
import type { DateRange } from '../headless/useRangeCalendar'

export type ServerValidationResponse = {
  valid: boolean
  message?: string
  code?: string
}

type FetchLike = typeof fetch

type ValidationAdapterOptions = {
  fetchImpl?: FetchLike
  fallbackMessage: string
}

const invalidResult = (message: string, code?: string): AsyncValidationResult => ({
  valid: false,
  message,
  code,
})

export const mapServerValidationResponse = (
  response: ServerValidationResponse,
  fallbackMessage: string,
): AsyncValidationResult =>
  response.valid
    ? { valid: true }
    : invalidResult(response.message ?? fallbackMessage, response.code)

const parseServerValidationResponse = async (
  response: Response,
): Promise<ServerValidationResponse | null> => {
  try {
    const parsed = (await response.json()) as Partial<ServerValidationResponse>
    if (typeof parsed.valid !== 'boolean') {
      return null
    }

    return {
      valid: parsed.valid,
      message: typeof parsed.message === 'string' ? parsed.message : undefined,
      code: typeof parsed.code === 'string' ? parsed.code : undefined,
    }
  } catch {
    return null
  }
}

const postValidationRequest = async (
  url: string,
  body: Record<string, string | null>,
  { fetchImpl = fetch, fallbackMessage }: ValidationAdapterOptions,
): Promise<AsyncValidationResult> => {
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const parsed = await parseServerValidationResponse(response)
    if (!parsed) {
      return invalidResult(fallbackMessage, 'INVALID_SERVER_RESPONSE')
    }

    return mapServerValidationResponse(parsed, fallbackMessage)
  } catch {
    return invalidResult(fallbackMessage, 'NETWORK_ERROR')
  }
}

export const createDateValidationAdapter = (
  url: string,
  options: Partial<ValidationAdapterOptions> = {},
) => {
  const fallbackMessage = options.fallbackMessage ?? 'Date is not available.'

  return async (date: Date): Promise<AsyncValidationResult> =>
    postValidationRequest(
      url,
      { date: date.toISOString() },
      { fetchImpl: options.fetchImpl, fallbackMessage },
    )
}

export const createRangeValidationAdapter = (
  url: string,
  options: Partial<ValidationAdapterOptions> = {},
) => {
  const fallbackMessage = options.fallbackMessage ?? 'Range is not available.'

  return async (range: DateRange): Promise<AsyncValidationResult> =>
    postValidationRequest(
      url,
      {
        start: range.start?.toISOString() ?? null,
        end: range.end?.toISOString() ?? null,
      },
      { fetchImpl: options.fetchImpl, fallbackMessage },
    )
}
