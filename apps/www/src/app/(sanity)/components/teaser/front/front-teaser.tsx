import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { BylineShort } from '@/app/(sanity)/components/teaser/feed/helpers'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import type { FrontTeaser, TEASER_BLOCK_QUERY_RESULT } from '@/sanity.types'
import { css, cva } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import { getImageDimensions } from '@sanity/asset-utils'
import { stegaClean } from 'next-sanity'
import { Image } from 'next-sanity/image'
import Link from 'next/link'

type TeaserProps = TEASER_BLOCK_QUERY_RESULT['block']['reference']

export function FrontTeaser({ href, value }: TeaserProps) {
  switch (value.layout) {
    case 'IMAGE':
      return <ImageTeaser href={href} value={value} />
    case 'TEXT':
      return <TextTeaser href={href} value={value} />
    case 'VIGNETTE':
      return <VignetteTeaser href={href} value={value} />
    case 'SPLIT':
      return <SplitTeaser href={href} value={value} />
    default:
      return null
  }
}

const teaserTextContainer = css({
  md: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    p: '12',
  },
})

const teaserTextPosition = cva({
  base: {},
  variants: {
    position: {
      TOP_LEFT: {
        md: { placeSelf: 'start start' },
      },
      TOP_RIGHT: {
        md: { gridColumn: '2', placeSelf: 'start end' },
      },
      BOTTOM_LEFT: {
        md: { placeSelf: 'end start' },
      },
      BOTTOM_RIGHT: {
        md: { gridColumn: '2', placeSelf: 'end end' },
      },
      TOP: {
        md: {
          gridColumn: '1 / -1',
          placeSelf: 'start center',
        },
      },
      MIDDLE: {
        md: {
          gridColumn: '1 / -1',
          placeSelf: 'center center',
        },
      },
      BOTTOM: {
        md: {
          gridColumn: '1 / -1',
          placeSelf: 'end center',
        },
      },
      UNDERNEATH: {},
    },
  },
  defaultVariants: {
    position: 'MIDDLE',
  },
})

const teaserTitle = cva({
  base: {
    textStyle: 'editorialTitle',
    fontSize: '38px',
    lineHeight: '43px',
    md: {
      fontSize: '58px',
      lineHeight: '60px',
    },
  },
  variants: {
    size: {
      SMALL: {},
      LARGE: { md: { fontSize: '125px', lineHeight: '137px' } },
      MEDIUM: { md: { fontSize: '100px', lineHeight: '110px' } },
      STANDARD: { md: { fontSize: '80px', lineHeight: '90px' } },
    },
  },
  defaultVariants: {
    size: 'STANDARD',
  },
})

const teaserLead = css({
  textStyle: 'editorialLead',
  fontSize: '19px',
  lineHeight: '27px',
  md: {
    fontSize: '23px',
  },
})

const teaserContainer = css({
  position: 'relative',
  display: 'grid',
  gridColumn: 'full',
})

function ImageTeaser({ href, value }: TeaserProps) {
  const asset = value.image?.asset

  const src = urlFor(asset).url()
  const dimensions = getImageDimensions(src)

  return (
    <div
      className={teaserContainer}
      style={{ backgroundColor: value.backgroundColor?.hex }}
    >
      <Image
        className={css({ display: 'block', width: '100%', height: 'auto' })}
        src={src}
        alt={''}
        width={dimensions.width}
        height={dimensions.height}
        sizes={'100vw'}
      />
      <div className={teaserTextContainer}>
        <div
          className={teaserTextPosition({
            position: stegaClean(value.textPosition),
          })}
          style={{ color: value.color?.hex }}
        >
          <Link href={href} className={linkOverlay()}>
            <h2 className={teaserTitle({ size: stegaClean(value.textSize) })}>
              <InlinePortableText value={value.title} />
            </h2>
          </Link>
          <p className={teaserLead}>
            <InlinePortableText value={value.lead} />
          </p>
          <BylineShort teaser={value} />
        </div>
      </div>
    </div>
  )
}

function TextTeaser({ value }: TeaserProps) {
  return (
    <div>
      <h2>
        <InlinePortableText value={value.title} />
      </h2>
      <p>
        <InlinePortableText value={value.lead} />
      </p>
    </div>
  )
}

function VignetteTeaser({ value }: TeaserProps) {
  return (
    <div>
      <h2>
        <InlinePortableText value={value.title} />
      </h2>
      <p>
        <InlinePortableText value={value.lead} />
      </p>
    </div>
  )
}

function SplitTeaser({ value }: TeaserProps) {
  return (
    <div>
      <h2>
        <InlinePortableText value={value.title} />
      </h2>
      <p>
        <InlinePortableText value={value.lead} />
      </p>
    </div>
  )
}
