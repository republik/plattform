import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { Heading } from '@/app/(sanity)/components/teaser/large/helpers'
import type { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { css, cva } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import Link from 'next/link'

const teaserTitle = cva({
  base: {
    textStyle: 'editorialTitle',
    textWrap: 'balance',
    fontSize: '38px',
    lineHeight: '45px',
    md: {
      fontSize: '100px',
      lineHeight: '110px',
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
  position: 'relative', // place above the link overlay
})

const teaserByline = css({
  textStyle: 'metaParagraph',
  fontSize: 's',
  position: 'relative', // place above the link overlay
})

export function TextTeaser({
  _type,
  slug,
  theme,
  teaser,
  heading,
}: TeaserLargeFragmentType) {
  const href = _type === 'article' ? `/articles${slug}` : `/pages${slug}`

  return (
    <div
      className={css({
        position: 'relative',
        display: 'grid',
        gridColumn: 'full',
      })}
      style={{
        color: teaser.color?.hex,
        backgroundColor: teaser.backgroundColor?.hex,
      }}
    >
      <div
        className={css({
          margin: '0 auto',
          py: '10',
          px: '4',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '3',
          md: {
            width: '70%',
            minWidth: 'min-content',
            py: '20',
            gap: '6',
          },
          lg: {
            py: '24',
          },
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
  )
}
