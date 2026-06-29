'use client'

import { useForceTheme } from '@/app/components/theme-provider'
import type { Theme } from '@/sanity.types'

export function Theme({ theme }: { theme?: Omit<Theme, '_type'> }) {
  if (!theme) return null

  if (theme.darkMode) {
    useForceTheme('dark')
  }

  return (
    <style>{`:root { --page-theme-accent-color: ${theme?.accentColor?.hex}; }`}</style>
  )
}
