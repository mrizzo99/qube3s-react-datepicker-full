import { describe, expect, it } from 'vitest'
import { mergeThemeWithSkin } from './theming'

describe('mergeThemeWithSkin', () => {
  it('replaces string and function class slots by default while merging icons', () => {
    const merged = mergeThemeWithSkin(
      {
        containerClassName: 'base-shell',
        dayButtonClassName: ({ active }: { active: boolean }) => (active ? 'base-active' : 'base-idle') as string,
        icons: {
          prevMonth: '<',
          nextMonth: 'base-next',
        },
      },
      {
        containerClassName: 'motion-shell',
        dayButtonClassName: ({ active }: { active: boolean }) => (active ? 'motion-active' : 'motion-idle') as string,
        icons: {
          nextMonth: '>',
        },
      },
    )

    expect(merged.containerClassName).toBe('motion-shell')
    expect(merged.dayButtonClassName?.({ active: true })).toBe('motion-active')
    expect(merged.dayButtonClassName?.({ active: false })).toBe('motion-idle')
    expect(merged.icons).toEqual({
      prevMonth: '<',
      nextMonth: '>',
    })
  })

  it('supports additive class-slot skins when explicitly requested', () => {
    const merged = mergeThemeWithSkin(
      {
        containerClassName: 'base-shell',
        dayButtonClassName: ({ active }: { active: boolean }) => (active ? 'base-active' : 'base-idle') as string,
      },
      {
        __mergeClassSlots: true,
        containerClassName: 'motion-shell',
        dayButtonClassName: ({ active }: { active: boolean }) => (active ? 'motion-active' : 'motion-idle') as string,
      },
    )

    expect(merged.containerClassName).toBe('base-shell motion-shell')
    expect(merged.dayButtonClassName?.({ active: true })).toBe('base-active motion-active')
    expect(merged.dayButtonClassName?.({ active: false })).toBe('base-idle motion-idle')
  })
})
