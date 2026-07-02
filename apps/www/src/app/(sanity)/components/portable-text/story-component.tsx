'use client'
import { Spinner } from '@/app/components/ui/spinner'
import type { StoryComponent } from '@/sanity.types'
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
export function StoryComponent({ value }: { value: StoryComponent }) {
  const [error, setError] = useState<string | null>(null)

  if (!value.url) {
    return null
  }

  const Component = value.tagname as any

  if (!error && !Component) {
    setError(`Invalid component name: ${value.tagname}`)
  }

  // Attention: JSON is only valid if Sanity Stega chars are removed
  const dataJson = stegaClean(value.componentData?.code ?? '{}')

  return (
    <div
      data-story-component={`${Component}`}
      className={figureStyle({ size: value.size })}
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
        src={value.url}
        strategy='lazyOnload'
        onError={(e) => {
          console.error(
            `Story Component '${Component}' could not be loaded from '${value.url}'`,
            e,
          )
          setError('Beim Laden dieser Komponente ist ein Fehler aufgetreten.')
        }}
      />
    </div>
  )
}
