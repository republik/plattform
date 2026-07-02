'use client'
import { Spinner } from '@/app/components/ui/spinner'
import type { DynamicComponent } from '@/sanity.types'
import { css } from '@republik/theme/css'
import { stegaClean } from 'next-sanity'
import Script from 'next/script'
import { useState } from 'react'

const DYNAMIC_COMPONENTS_BASE_URL =
  process.env.NEXT_PUBLIC_DYNAMIC_COMPONENTS_BASE_URL ??
  'http://localhost:3000/'

export function DynamicComponent({ value }: { value: DynamicComponent }) {
  const [error, setError] = useState<string | null>(null)

  if (!value.src) {
    return null
  }

  const src = new URL(value.src)
  const match = src.pathname.match(
    /\/dynamic-components\/([a-z0-9\-]+)\/([a-z0-9\-]+)\.js/,
  )
  const componentName = match
    ? match[2] === 'index'
      ? match[1]
      : `${match[1]}-${match[2]}`
    : null

  if (!error && !componentName) {
    setError(`Invalid component name: ${src.pathname}`)
  }

  // TODO: figure out where to put tagname
  // TODO: generic shape for component data
  const Component = `republik-${componentName}` as any
  // https://story-git-migrate-dynamic-components.preview.republik.love
  const componentSrc = new URL(
    `/legacy/dynamic-components/${componentName}/dist/index.mjs`,
    DYNAMIC_COMPONENTS_BASE_URL,
  )

  // Attention: JSON is only valid if Sanity Stega chars are removed
  const dataJson = stegaClean(value.props?.code ?? '{}')

  return (
    <div data-dynamic-component={`${componentName}`}>
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
      <Component data={dataJson}>
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
        src={componentSrc.toString()}
        strategy='lazyOnload'
        onError={(e) => {
          console.error(
            `Dynamic Component '${componentName}' could not be loaded from '${componentSrc.toString()}'`,
            e,
          )
          setError('Beim Laden dieser Komponente ist ein Fehler aufgetreten.')
        }}
      />
    </div>
  )
}
