import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import {
  Heading,
  LinkOverlay,
} from '@/app/(sanity)/components/teaser/_shared/helpers'
import { typography } from '@/app/(sanity)/components/teaser/_shared/teaser-list-typography'
import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
import { SanitySquareCover } from '@/app/components/assets/SquareCover'
import { css, cx } from '@republik/theme/css'
import React from 'react'

export default function GridTeaser({ teaser }: { teaser: TeaserFragmentType }) {
  return (
    <div className={cx(typography, css({ position: 'relative' }))}>
      <Heading teaser={teaser} />
      <SanitySquareCover size='100%' />
      <h4>
        <LinkOverlay teaser={teaser} />
      </h4>
      {teaser.description && (
        <p className='description'>
          <InlinePortableText value={teaser.description} />
        </p>
      )}
    </div>
  )
}
