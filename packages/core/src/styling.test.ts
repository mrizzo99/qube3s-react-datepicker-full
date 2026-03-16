import { describe, expect, it } from 'vitest'
import {
  CORE_STYLE_VARIABLE_NAMES,
  getAppearanceScopeClassName,
  normalizeCoreStyleVariables,
} from './styling'

describe('getAppearanceScopeClassName', () => {
  it('returns a dark scope class only for explicit dark appearance', () => {
    expect(getAppearanceScopeClassName()).toBe('')
    expect(getAppearanceScopeClassName('inherit')).toBe('')
    expect(getAppearanceScopeClassName('light')).toBe('')
    expect(getAppearanceScopeClassName('dark')).toBe('dark')
  })
})

describe('normalizeCoreStyleVariables', () => {
  it('keeps only supported datepicker css variables with defined values', () => {
    const normalized = normalizeCoreStyleVariables({
      '--rdp-accent': '#0f766e',
      '--rdp-border': 1,
      '--rdp-surface': undefined,
      ...( { '--rdp-ignored': '#000' } as Record<string, string> ),
    } as Record<string, string | number | undefined>)

    expect(normalized).toEqual({
      '--rdp-accent': '#0f766e',
      '--rdp-border': 1,
    })
  })

  it('exports the supported variable names as a stable public contract', () => {
    expect(CORE_STYLE_VARIABLE_NAMES).toEqual([
      '--rdp-accent',
      '--rdp-accent-foreground',
      '--rdp-ring',
      '--rdp-surface',
      '--rdp-surface-foreground',
      '--rdp-border',
    ])
  })
})
