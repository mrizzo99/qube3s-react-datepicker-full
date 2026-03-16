import { describe, expect, it } from 'vitest'
import { mergeThemeWithSkin } from './theming'

describe('mergeThemeWithSkin', () => {
  it('appends string and function class slots while merging icons', () => {
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

    expect(merged.containerClassName).toBe('base-shell motion-shell')
    expect(merged.dayButtonClassName?.({ active: true })).toBe('base-active motion-active')
    expect(merged.dayButtonClassName?.({ active: false })).toBe('base-idle motion-idle')
    expect(merged.icons).toEqual({
      prevMonth: '<',
      nextMonth: '>',
    })
  })
})
