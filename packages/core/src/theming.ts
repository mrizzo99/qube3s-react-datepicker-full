export type ThemeMode = 'light' | 'dark'

type ThemeWithIcons = {
  icons?: Record<string, unknown>
}

export type ThemeSkin<TTheme extends ThemeWithIcons> = Omit<Partial<TTheme>, 'icons'> & {
  icons?: Partial<NonNullable<TTheme['icons']>>
}

export const getThemeScopeClassName = (theme?: ThemeMode) => (theme === 'dark' ? 'dark' : '')

export const mergeThemeWithSkin = <TTheme extends ThemeWithIcons>(
  baseTheme: TTheme,
  skin?: ThemeSkin<TTheme>,
): TTheme => {
  if (!skin) return baseTheme

  const mergedIcons =
    baseTheme.icons || skin.icons
      ? {
          ...(baseTheme.icons ?? {}),
          ...(skin.icons ?? {}),
        }
      : undefined

  return {
    ...baseTheme,
    ...skin,
    ...(mergedIcons ? { icons: mergedIcons } : {}),
  }
}
