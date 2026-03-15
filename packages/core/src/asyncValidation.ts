export type AsyncValidationResult =
  | { valid: true }
  | { valid: false; message: string; code?: string }

export type AsyncValidationState = 'idle' | 'validating' | 'invalid'

export type AsyncValidationBehavior = 'blocking' | 'optimistic'

export type AsyncValidationStateChange<TValue> = {
  state: AsyncValidationState
  candidate: TValue | null
  message?: string
  code?: string
}
