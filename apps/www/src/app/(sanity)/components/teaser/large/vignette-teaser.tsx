import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import {
  Heading,
  TeaserLargeImage,
} from '@/app/(sanity)/components/teaser/large/helpers'
import type { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { dataAttribute } from '@/app/(sanity)/lib/data-attribute'
import { css, cva } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import Link from 'next/link'

const teaserStyle = cva({
  base: {
    position: 'relative',
    px: '4',
    py: '8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8',
    md: {
      py: '16',
    },
  },
  variants: {},

  defaultVariants: {},
})

const teaserTitle = cva({
  base: {
    textWrap: 'balance',
    fontSize: '38px',
    lineHeight: '43px',
    md: { fontSize: '58px', lineHeight: '60px' },
    lg: { fontSize: '80px', lineHeight: '90px' },
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
      SMALL: {
        fontSize: '26px',
        lineHeight: '32px',
        md: {
          fontSize: '48px',
          lineHeight: '54px',
        },
      },
      MEDIUM: {
        md: { fontSize: '60px', lineHeight: '70px' },
        lg: { fontSize: '80px', lineHeight: '90px' },
      },
      LARGE: {
        md: { fontSize: '80px', lineHeight: '90px' },
        lg: { fontSize: '100px', lineHeight: '110px' },
      },
      STANDARD: {},
    },
  },
  defaultVariants: {
    theme: 'META',
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
  position: 'relative', // place above the link overlay
})

const teaserByline = css({
  textStyle: 'metaParagraph',
  fontSize: 's',
  position: 'relative', // place above the link overlay
})

const imageStyle = css({
  display: 'block',
  width: 'full',
  minWidth: '100px',
  maxWidth: '220px',
  maxHeight: '220px',
  md: {
    maxWidth: '300px',
    maxHeight: '300px',
  },
  lg: {
    maxWidth: '360px',
    maxHeight: '360px',
  },
  zIndex: 1, // place above the link overlay
})

export function VignetteTeaser({
  _id,
  _type,
  slug,
  theme,
  heading,
  teaser,
}: TeaserLargeFragmentType) {
  const href = _type === 'article' ? `/articles${slug}` : `/pages${slug}`

  return (
    <div
      className={teaserStyle()}
      style={{ backgroundColor: teaser.backgroundColor?.hex }}
    >
      <div className={css({ position: 'relative', zIndex: 1 })}>
        <TeaserLargeImage
          data-sanity={dataAttribute({
            id: _id,
            type: _type,
            path: 'teaserLarge.image',
          })}
          image={teaser.image}
          className={imageStyle}
          alt={''}
          sizes={'(max-width: 768px) 100vw, 50vw'}
        />
      </div>
      <div
        className={css({
          padding: '0',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '3',
          md: {
            px: '13%',
          },
        })}
        style={{ color: teaser.color?.hex }}
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
  )
}
