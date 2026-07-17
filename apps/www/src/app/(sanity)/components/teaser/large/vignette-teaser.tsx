import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { TeaserLargeImage } from '@/app/(sanity)/components/teaser/large/helpers'
import type { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { css, cva } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import Link from 'next/link'

const teaserStyle = cva({
  base: {
    position: 'relative',
    px: '4',
    py: '8',
    padding: '30px 15px 40px 15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6',
    md: {
      py: '16',
    },
  },
  variants: {},

  defaultVariants: {},
})

const teaserTitle = cva({
  base: {
    fontSize: '38px',
    lineHeight: '43px',
    md: { fontSize: '58px', lineHeight: '60px' },
    lg: { fontSize: '80px', lineHeight: '90px' },
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
        md: {
          fontSize: '58px',
          lineHeight: '60px',
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
})

const teaserByline = css({
  textStyle: 'metaParagraph',
  fontSize: 's',
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
})

export function VignetteTeaser({
  _type,
  slug,
  theme,
  teaser,
}: TeaserLargeFragmentType) {
  const href = _type === 'article' ? `/articles${slug}` : `/pages${slug}`

  return (
    <div
      className={teaserStyle()}
      style={{ backgroundColor: teaser.backgroundColor?.hex }}
    >
      <div>
        <TeaserLargeImage
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
            padding: '0 13%',
          },
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
          <InlinePortableText value={teaser.description} />
        </p>
        <p className={teaserByline}>
          <InlinePortableText value={teaser.byline} />
        </p>
      </div>
    </div>
  )
}
