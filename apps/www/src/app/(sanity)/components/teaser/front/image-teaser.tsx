import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { FrontTeaserImage } from '@/app/(sanity)/components/teaser/front/helpers'
import type { FrontTeaserFragmentType } from '@/app/(sanity)/groq/front-teaser-fragment'
import { css, cva } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import Link from 'next/link'

type TeaserProps = FrontTeaserFragmentType

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
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
  },
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
          // centering the text could be a separate style but for now it's not a setting
          textAlign: 'center',
        },
      },
      MIDDLE: {
        md: {
          gridColumn: '1 / -1',
          placeSelf: 'center center',
          // centering the text could be a separate style but for now it's not a setting
          textAlign: 'center',
        },
      },
      BOTTOM: {
        md: {
          gridColumn: '1 / -1',
          placeSelf: 'end center',
          // centering the text could be a separate style but for now it's not a setting
          textAlign: 'center',
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
    theme: {
      META: {
        textStyle: 'metaTitle',
      },
      EDITORIAL: {
        textStyle: 'editorialTitle',
      },
      PAGE: {
        textStyle: 'metaTitle',
      },
    },
    size: {
      SMALL: {},
      LARGE: { md: { fontSize: '125px', lineHeight: '137px' } },
      MEDIUM: { md: { fontSize: '100px', lineHeight: '110px' } },
      STANDARD: { md: { fontSize: '80px', lineHeight: '90px' } },
    },
  },
  defaultVariants: { theme: 'META', size: 'STANDARD' },
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

const teaserByline = css({
  textStyle: 'metaParagraph',
  fontSize: 's',
})

export function ImageTeaser({ _type, slug, theme, teaser }: TeaserProps) {
  const href = _type === 'article' ? `/article${slug}` : `/page/${slug}`

  return (
    <div
      className={teaserContainer}
      style={{ backgroundColor: teaser.backgroundColor?.hex }}
    >
      <FrontTeaserImage
        asset={teaser.image?.asset}
        className={css({ display: 'block', width: '100%', height: 'auto' })}
        alt={''}
        sizes={'100vw'}
      />
      <div className={teaserTextContainer}>
        <div
          className={teaserTextPosition({
            position: teaser.textPosition,
          })}
          style={{ color: teaser.color?.hex }}
        >
          <Link href={href} className={linkOverlay()}>
            <h2
              className={teaserTitle({
                theme: theme?.name,
                size: teaser.textSize,
              })}
            >
              <InlinePortableText value={teaser.title} />
            </h2>
          </Link>
          <p className={teaserLead}>
            <InlinePortableText value={teaser.lead} />
          </p>
          <p className={teaserByline}>
            <InlinePortableText value={teaser.byline} />
          </p>
        </div>
      </div>
    </div>
  )
}
