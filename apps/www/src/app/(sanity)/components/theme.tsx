import type { Theme } from '@/sanity.types'

export function Theme({ theme }: { theme?: Omit<Theme, '_type'> }) {
  if (!theme) return null

  return (
    <style>{`:root { --page-theme-accent-color: ${theme?.accentColor?.hex}; }`}</style>
  )
}
