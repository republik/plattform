import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import {
  Heading,
  TeaserLargeImage,
} from '@/app/(sanity)/components/teaser/large/helpers'
import type { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { css, cva } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import Link from 'next/link'

const teaserTextContainer = css({
  py: '10',
  px: '4',
  md: {
    py: '20',
    px: '15%',
  },
  lg: {
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
    md: { gap: '6' },
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
    textWrap: 'balance',
    fontSize: '38px',
    lineHeight: '43px',
    md: {
      fontSize: '58px',
      lineHeight: '60px',
    },
    position: 'relative', // place above the link overlay
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
  position: 'relative', // place above the link overlay
})

const teaserContainer = css({
  position: 'relative',
  display: 'grid',
  gridColumn: 'full',
})

const teaserByline = css({
  textStyle: 'metaParagraph',
  fontSize: 's',
  position: 'relative', // place above the link overlay
})

export function ImageTeaser({
  _type,
  slug,
  theme,
  heading,
  teaser,
}: TeaserLargeFragmentType) {
  const href = _type === 'article' ? `/articles${slug}` : `/pages${slug}`

  return (
    <div
      className={teaserContainer}
      style={{
        color: teaser.color?.hex,
        backgroundColor: teaser.backgroundColor?.hex,
      }}
    >
      <div className={css({ position: 'relative' })}>
        <TeaserLargeImage
          image={teaser.image}
          className={css({ display: 'block', width: '100%', height: 'auto' })}
          alt={''}
          sizes={'100vw'}
        />

        {teaser.imageCredits && (
          <span
            className={css({
              fontSize: 'xs',
              pl: '2',
              pt: '1',
              display: 'block',

              md: {
                position: 'absolute',
                bottom: '0',
                left: 'calc(1lh + 0.25rem)',
                transform: 'rotate(-90deg)',
                transformOrigin: 'bottom left',
              },
            })}
          >
            {teaser.imageCredits}
          </span>
        )}
      </div>

      <div className={teaserTextContainer}>
        <div
          className={teaserTextPosition({
            position: teaser.textPosition,
          })}
        >
          {heading && <Heading heading={heading} />}

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
            <InlinePortableText value={teaser.description} />
          </p>
          <p className={teaserByline}>
            <InlinePortableText value={teaser.byline} />
          </p>
        </div>
      </div>
    </div>
  )
}
