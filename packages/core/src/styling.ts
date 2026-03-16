import type { CSSProperties } from 'react'

export type CoreAppearance = 'inherit' | 'light' | 'dark'

export const CORE_STYLE_VARIABLE_NAMES = [
  '--rdp-accent',
  '--rdp-accent-foreground',
  '--rdp-ring',
  '--rdp-surface',
  '--rdp-surface-foreground',
  '--rdp-border',
] as const

export type CoreStyleVariableName = (typeof CORE_STYLE_VARIABLE_NAMES)[number]
export type CoreStyleVariableValue = string | number

export type CoreStyleVariables = Partial<Record<CoreStyleVariableName, CoreStyleVariableValue>>

export type CoreStyleProperties = CSSProperties & CoreStyleVariables

export const getAppearanceScopeClassName = (appearance: CoreAppearance = 'inherit') =>
  appearance === 'dark' ? 'dark' : ''

export const normalizeCoreStyleVariables = (
  styleVariables?: CoreStyleVariables | null,
): CoreStyleVariables => {
  if (!styleVariables) return {}

  return Object.fromEntries(
    CORE_STYLE_VARIABLE_NAMES.flatMap(variableName => {
      const value = styleVariables[variableName]
      return value === undefined ? [] : [[variableName, value] as const]
    }),
  ) as CoreStyleVariables
}
