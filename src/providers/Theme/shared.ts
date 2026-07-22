import type { Theme } from './types'

export const themeLocalStorageKey = 'payload-theme'

// Strona jest dark-first (styl industrialny) — domyślnie ciemny motyw.
export const defaultTheme = 'dark'

export const getImplicitPreference = (): Theme | null => {
  const mediaQuery = '(prefers-color-scheme: dark)'
  const mql = window.matchMedia(mediaQuery)
  const hasImplicitPreference = typeof mql.matches === 'boolean'

  if (hasImplicitPreference) {
    return mql.matches ? 'dark' : 'light'
  }

  return null
}
