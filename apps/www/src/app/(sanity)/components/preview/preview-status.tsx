'use client'
import { css, cva } from '@republik/theme/css'
import { useVisualEditingEnvironment } from 'next-sanity/hooks'
import type { LivePerspective } from 'next-sanity/live'

const perspectiveStyle = cva({
  base: {
    fontSize: 's',
    px: '2',
    py: '1',
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid currentColor',
  },
  variants: {
    perspective: {
      published: {
        backgroundColor: '#d0f4dc',
        color: '#215233',
      },
      drafts: {
        backgroundColor: '#fdefb6',
        color: '#534717',
      },
    },
  },
})

export function PreviewStatus({
  perspective,
}: {
  perspective: LivePerspective
}) {
  const visualEditingEnvironment = useVisualEditingEnvironment()

  if (
    !visualEditingEnvironment ||
    visualEditingEnvironment === 'presentation-iframe'
  ) {
    return null
  }

  return (
    <div
      className={perspectiveStyle({
        perspective:
          perspective === 'drafts'
            ? 'drafts'
            : perspective === 'published'
            ? 'published'
            : undefined,
      })}
    >
      <span>
        Vorschau:{' '}
        {perspective === 'drafts'
          ? 'In Bearbeitung'
          : perspective === 'published'
          ? 'Publizierte Version'
          : JSON.stringify(perspective)}
      </span>
      <button
        className={css({ textDecoration: 'underline' })}
        onClick={() => {
          fetch('/api/draft/disable').then(() => window.location.reload())
        }}
      >
        Vorschau verlassen
      </button>
    </div>
  )
}
