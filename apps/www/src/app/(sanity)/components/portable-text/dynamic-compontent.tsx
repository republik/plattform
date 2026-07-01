'use client'
import { Spinner } from '@/app/components/ui/spinner'
import type { DynamicComponent } from '@/sanity.types'
import { css } from '@republik/theme/css'
import { stegaClean } from 'next-sanity'
import Script from 'next/script'
import { useState } from 'react'

export function DynamicComponent({ value }: { value: DynamicComponent }) {
  const [error, setError] = useState<string | null>(null)

  // TODO: figure out where to put tagname
  // TODO: generic shape for component data
  const Component = 'republik-quiz' as any

  // Attention: JSON is only valid if Sanity Stega chars are removed
  const dataJson = stegaClean(value.props?.code ?? '{}')

  return (
    <div>
      {error && (
        <div
          className={css({
            textStyle: 'sans',
            color: 'error',
          })}
        >
          {error}
        </div>
      )}
      <Component data={dataJson}>
        <div
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
        src='https://story-git-migrate-dynamic-components.preview.republik.love/legacy/dynamic-components/quiz/dist/index.mjs'
        // src='http://localhost:3000/legacy/dynamic-components/quiz/dist/index.mjs'
        strategy='lazyOnload'
        onError={(e) => {
          console.error('Dynamic Component could not be loaded', e)
          setError('Beim Laden dieser Komponente ist ein Fehler aufgetreten.')
        }}
      />
    </div>
  )
}
