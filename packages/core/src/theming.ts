export type ThemeMode =
  | 'light'
  | 'dark'
  | 'material-light'
  | 'material-dark'
  | 'modern-minimal-light'
  | 'modern-minimal-dark'
  | 'booking-light'
  | 'booking-dark'

type ThemeWithIcons = Record<string, unknown> & {
  icons?: Record<string, unknown>
}

export type ThemeSkin<TTheme extends ThemeWithIcons> = Omit<Partial<TTheme>, 'icons'> & {
  __mergeClassSlots?: boolean
  icons?: Partial<NonNullable<TTheme['icons']>>
}

export const isDarkTheme = (theme?: ThemeMode) =>
  theme === 'dark'
  || theme === 'material-dark'
  || theme === 'modern-minimal-dark'
  || theme === 'booking-dark'

export const isMaterialTheme = (theme?: ThemeMode) =>
  theme === 'material-light' || theme === 'material-dark'

export const isModernMinimalTheme = (theme?: ThemeMode) =>
  theme === 'modern-minimal-light' || theme === 'modern-minimal-dark'

export const isBookingTheme = (theme?: ThemeMode) =>
  theme === 'booking-light' || theme === 'booking-dark'

export const getThemeScopeClassName = (theme?: ThemeMode) => (isDarkTheme(theme) ? 'dark' : '')

const cx = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ')

export const mergeThemeWithSkin = <TTheme extends ThemeWithIcons>(
  baseTheme: TTheme,
  skin?: ThemeSkin<TTheme>,
): TTheme => {
  if (!skin) return baseTheme
  const shouldMergeClassSlots = skin.__mergeClassSlots === true

  const mergedIcons =
    baseTheme.icons || skin.icons
      ? {
          ...(baseTheme.icons ?? {}),
          ...(skin.icons ?? {}),
        }
      : undefined

  const mergedTheme = { ...baseTheme } as Record<string, unknown>
  const skinEntries = Object.entries(skin) as Array<[keyof ThemeSkin<TTheme>, unknown]>

  for (const [key, skinValue] of skinEntries) {
    if (key === 'icons' || key === '__mergeClassSlots' || skinValue === undefined) continue

    const baseValue = mergedTheme[key as string]

    if (typeof baseValue === 'string' && typeof skinValue === 'string') {
      mergedTheme[key as string] = shouldMergeClassSlots ? cx(baseValue, skinValue) : skinValue
      continue
    }

    if (typeof baseValue === 'function' && typeof skinValue === 'function') {
      mergedTheme[key as string] = shouldMergeClassSlots
        ? (...args: unknown[]) => {
            const baseResult = baseValue(...args)
            const skinResult = skinValue(...args)
            return cx(
              typeof baseResult === 'string' ? baseResult : undefined,
              typeof skinResult === 'string' ? skinResult : undefined,
            )
          }
        : skinValue
      continue
    }

    mergedTheme[key as string] = skinValue
  }

  return {
    ...(mergedTheme as TTheme),
    ...(mergedIcons ? { icons: mergedIcons } : {}),
  }
}
