'use client'

import { ArticleThemeType } from '@/app/(sanity)/lib/types'
import { useForceTheme } from '@/app/components/theme-provider'

export function ArticleTheme({ theme }: { theme?: ArticleThemeType }) {
  if (!theme) return null

  if (theme.darkMode) {
    useForceTheme('dark')
  }

  return (
    <style>{`:root { --page-theme-accent-color: ${theme?.color?.hex}; }`}</style>
  )
}
