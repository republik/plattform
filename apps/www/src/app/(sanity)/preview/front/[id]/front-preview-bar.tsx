'use client'

import { css } from '@republik/theme/css'
import { useVisualEditingEnvironment } from 'next-sanity/hooks'
import type { PropsWithChildren } from 'react'

export function FrontPreviewBar({
  sanityDataAttr,
  children,
}: PropsWithChildren<{ sanityDataAttr: string }>) {
  const visualEditingEnvironment = useVisualEditingEnvironment()

  if (visualEditingEnvironment !== 'presentation-iframe') {
    return null
  }

  return (
    <div
      data-sanity={sanityDataAttr}
      className={css({
        cursor: 'pointer',
        position: 'sticky',
        top: '0',
        zIndex: 99,
        bg: 'text',
        color: 'text.white',
        fontWeight: 'medium',
        px: '2',
        py: '2',
        display: 'flex',
        gap: '2',
      })}
    >
      {children}
    </div>
  )
}
