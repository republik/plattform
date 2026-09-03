import type { Theme } from '@/sanity.types'

export function Theme({ theme }: { theme?: Omit<Theme, '_type'> }) {
  if (!theme) return null

  return (
    <style>{`:root { --page-theme-accent-color: ${
      theme?.accentColor?.hex
    }; --page-theme-accent-bar-height: ${
      theme?.accentColor?.hex ? '3px' : 0
    } }`}</style>
  )
}
