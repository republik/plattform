import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import type { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { css, cva } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import Link from 'next/link'

const teaserTitle = cva({
  base: {
    textStyle: 'editorialTitle',
    fontSize: '38px',
    lineHeight: '45px',
    md: {
      fontSize: '100px',
      lineHeight: '110px',
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
      SMALL: {
        fontSize: '26px',
        lineHeight: '31px',
        md: {
          fontSize: '50px',
          lineHeight: '57px',
        },
        lg: {
          fontSize: '64px',
          lineHeight: '72px',
        },
      },
      LARGE: {
        md: { fontSize: '125px', lineHeight: '137px' },
        lg: { fontSize: '156px', lineHeight: '169px' },
      },
      MEDIUM: { md: { fontSize: '125px', lineHeight: '137px' } },
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

export function TextTeaser({
  _type,
  slug,
  theme,
  teaser,
}: TeaserLargeFragmentType) {
  const href = _type === 'article' ? `/articles${slug}` : `/pages${slug}`

  return (
    <div
      className={css({
        position: 'relative',
        display: 'grid',
        gridColumn: 'full',
      })}
      style={{ backgroundColor: teaser.backgroundColor?.hex }}
    >
      <div
        className={css({
          margin: '0 auto',
          padding: '15px 15px 40px 15px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '3',
          md: {
            maxWidth: `70%`,
            padding: '60px 0 80px 0',
            gap: '6',
          },
          lg: {
            padding: '80px 0 100px 0',
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
