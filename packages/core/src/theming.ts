export type ThemeMode =
  | 'light'
  | 'dark'
  | 'material-light'
  | 'material-dark'
  | 'modern-minimal-light'
  | 'modern-minimal-dark'

type ThemeWithIcons = {
  icons?: Record<string, unknown>
}

export type ThemeSkin<TTheme extends ThemeWithIcons> = Omit<Partial<TTheme>, 'icons'> & {
  icons?: Partial<NonNullable<TTheme['icons']>>
}

export const isDarkTheme = (theme?: ThemeMode) =>
  theme === 'dark' || theme === 'material-dark' || theme === 'modern-minimal-dark'

export const isMaterialTheme = (theme?: ThemeMode) =>
  theme === 'material-light' || theme === 'material-dark'

export const isModernMinimalTheme = (theme?: ThemeMode) =>
  theme === 'modern-minimal-light' || theme === 'modern-minimal-dark'

export const getThemeScopeClassName = (theme?: ThemeMode) => (isDarkTheme(theme) ? 'dark' : '')

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
