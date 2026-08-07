'use client'
import { css } from '@republik/theme/css'
import { GalleryHorizontal } from 'lucide-react'
import { useVisualEditingEnvironment } from 'next-sanity/hooks'
import Link from 'next/link'

export function TeaserSmallPreviewLink({ documentId }: { documentId: string }) {
  const visualEditingEnvironment = useVisualEditingEnvironment()

  if (
    !visualEditingEnvironment ||
    visualEditingEnvironment === 'presentation-iframe'
  ) {
    return null
  }

  return (
    <Link
      href={`/preview/teaser-small/${documentId}`}
      target='_blank'
      className={css({
        px: '4',
        py: '2',
        backgroundColor: 'text',
        borderRadius: 'full',
        color: 'background',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2',
      })}
    >
      <GalleryHorizontal size={20} /> Teaser-Vorschau
    </Link>
  )
}
