import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { FrontTeaserImage } from '@/app/(sanity)/components/teaser/front/helpers'
import type { FrontTeaserFragmentType } from '@/app/(sanity)/groq/front-teaser-fragment'
import { css, cva } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import { stegaClean } from 'next-sanity'
import Link from 'next/link'

type TeaserProps = FrontTeaserFragmentType

const teaserStyle = cva({
  base: {
    margin: 0,
    overflow: 'hidden',
    position: 'relative',

    gap: '5%',
    alignItems: 'center',
    justifyContent: 'center',
    md: {
      display: 'grid',
      padding: '70px 5%',
    },
  },
  variants: {
    imagePosition: {
      LEFT: {
        gridTemplateAreas: '"image content"',
        gridTemplateColumns: '50% 1fr',
      },
      RIGHT: {
        gridTemplateAreas: '"content image"',
        gridTemplateColumns: '1fr 50%',
      },
    },
    imagePadding: {
      TRUE: {},
      FALSE: {},
    },
  },
  compoundVariants: [
    {
      imagePadding: 'FALSE',
      imagePosition: 'LEFT',
      css: {
        gridTemplateAreas: '"image content empty"',
        gridTemplateColumns: '40% 1fr 0',
        alignItems: 'start',
        md: {
          padding: 0,
        },
      },
    },
    {
      imagePadding: 'FALSE',
      imagePosition: 'RIGHT',
      css: {
        gridTemplateAreas: '"empty content image"',
        gridTemplateColumns: '0 1fr 40%',
        alignItems: 'start',
        md: {
          padding: 0,
        },
      },
    },
  ],
  defaultVariants: {
    imagePosition: 'LEFT',
    imagePadding: 'FALSE',
  },
})

const teaserTitle = cva({
  base: {
    textStyle: 'editorialTitle',
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

const teaserByline = css({
  textStyle: 'metaParagraph',
  fontSize: 's',
})

export function SplitTeaser({ _type, slug, theme, teaser }: TeaserProps) {
  const href = _type === 'article' ? `/article${slug}` : `/page/${slug}`

  return (
    <div
      className={teaserStyle({
        imagePosition: stegaClean(teaser.imagePosition),
        imagePadding: teaser.imagePadding ? 'TRUE' : 'FALSE',
      })}
      style={{ backgroundColor: teaser.backgroundColor?.hex }}
    >
      <div
        className={css({
          gridArea: 'image',
          position: 'relative',
        })}
      >
        <FrontTeaserImage
          asset={teaser.image?.asset}
          className={css({ display: 'block', width: '100%', height: 'auto' })}
          alt={''}
          sizes={'(max-width: 768px) 100vw, 50vw'}
        />
      </div>
      <div
        className={css({
          gridArea: 'content',
          padding: '15px 15px 40px 15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3',
          md: {
            padding: 0,
          },
        })}
        style={{ color: teaser.color?.hex }}
      >
        <Link href={href} className={linkOverlay()}>
          <h2
            className={teaserTitle({
              theme: stegaClean(theme?.name),
              size: stegaClean(teaser.textSize),
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
  )
}
