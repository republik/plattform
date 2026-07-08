import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import {
  Heading,
  LinkOverlay,
} from '@/app/(sanity)/components/teaser/_shared/helpers'
import { carouselTeaserTypography } from '@/app/(sanity)/components/teaser/carousel/styles'
import { CarouselTeaserFragmentType } from '@/app/(sanity)/groq/carousel-teaser-fragment'
import { SanitySquareCover } from '@/app/components/assets/SquareCover'
import { css, cx } from '@republik/theme/css'
import React from 'react'

const carouselItemStyle = css({
  textAlign: 'left',
  scrollSnapAlign: 'start',
  scrollSnapMarginLeft: '15px',
  width: '240px',
  position: 'relative', // for the link overlay placement
  mb: 4,
  px: 3,
  md: {
    px: 4,
  },
  lg: {
    width: 'auto',
    maxWidth: '312px',
  },
})

export function CarouselTeaser({
  teaser,
}: {
  teaser: CarouselTeaserFragmentType
}) {
  console.log(teaser)
  return (
    <div className={cx(carouselTeaserTypography, carouselItemStyle)}>
      <div className={css({ border: '1px solid' })}>
        <div className={css({ marginBottom: 6 })}>
          <SanitySquareCover size={312} />
        </div>
        <Heading teaser={teaser} />
        <h4>
          <LinkOverlay teaser={teaser} />
        </h4>
        <p className='description'>
          <InlinePortableText value={teaser.description} />
        </p>
      </div>
    </div>
  )
}

// TODO: publishData / image
