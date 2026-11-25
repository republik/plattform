'use client'
import type { ArticlePortableTextBlockType } from '@/app/(sanity)/groq/portable-text-content-fragment'
import { Spinner } from '@/app/components/ui/spinner'
import { css, cva } from '@republik/theme/css'
import { stegaClean } from 'next-sanity'
import Script from 'next/script'
import { useState } from 'react'

const figureStyle = cva({
  base: {
    '& > figcaption': {
      mt: '1',
    },
  },
  variants: {
    size: {
      NORMAL: {},
      BREAKOUT: {
        gridColumn: 'breakout',
      },
      FULL: {
        gridColumn: 'full',
        '& > figcaption': {
          ml: '4',
        },
      },
    },
  },
})

export function StoryComponent({
  value,
}: {
  value: Extract<ArticlePortableTextBlockType, { _type: 'storyComponent' }>
}) {
  const [error, setError] = useState<string | null>(null)

  const url = stegaClean(value.url)
  const tagname = stegaClean(value.tagname)
  const size = stegaClean(value.size)
  const dataJson = stegaClean(value.componentData?.code) ?? '{}'

  if (!url) {
    return null
  }

  const Component = tagname as any

  if (!error && !Component) {
    setError(`Invalid component name: ${tagname}`)
  }

  return (
    <div
      data-story-component={`${Component}`}
      className={figureStyle({ size })}
    >
      {error && (
        <div
          data-state='error'
          className={css({
            textStyle: 'sans',
            color: 'error',
          })}
        >
          {error}
        </div>
      )}
      <Component componentdata={dataJson}>
        <div
          data-state='loading'
          className={css({
            minHeight: '150px',
            position: 'relative',
            display: 'grid',
            placeContent: 'center',
          })}
        >
          <Spinner />
        </div>
      </Component>
      <Script
        type='module'
        src={url}
        strategy='lazyOnload'
        onError={(e) => {
          console.error(
            `Story Component '${Component}' could not be loaded from '${url}'`,
            e,
          )
          setError('Beim Laden dieser Komponente ist ein Fehler aufgetreten.')
        }}
      />
    </div>
  )
}
