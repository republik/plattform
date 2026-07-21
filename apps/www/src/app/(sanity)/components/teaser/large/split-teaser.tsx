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
    margin: 0,
    overflow: 'hidden',
    position: 'relative',

    gap: '5%',
    alignItems: 'center',
    justifyContent: 'center',
    md: {
      display: 'grid',
      py: '16',
      px: '5%',
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
        md: {
          px: '0',
          py: '0',
        },
      },
    },
    {
      imagePadding: 'FALSE',
      imagePosition: 'RIGHT',
      css: {
        gridTemplateAreas: '"empty content image"',
        gridTemplateColumns: '0 1fr 40%',
        md: {
          px: '0',
          py: '0',
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
    textWrap: 'balance',
    fontSize: '38px',
    lineHeight: '43px',
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
        md: {
          fontSize: '58px',
          lineHeight: '60px',
        },
      },
      MEDIUM: {
        md: { fontSize: '60px', lineHeight: '70px' },
        lg: { fontSize: '80px', lineHeight: '90px' },
        xlg: { fontSize: '100px', lineHeight: '110px' },
      },
      LARGE: {
        md: { fontSize: '80px', lineHeight: '90px' },
        lg: { fontSize: '100px', lineHeight: '110px' },
        xlg: { fontSize: '125px', lineHeight: '135px' },
      },
      STANDARD: {
        lg: { fontSize: '60px', lineHeight: '70px' },
        xlg: { fontSize: '80px', lineHeight: '90px' },
      },
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

const teaserByline = css({
  textStyle: 'metaParagraph',
  fontSize: 's',
  position: 'relative', // place above the link overlay
})

const imageCredits = cva({
  base: {
    fontSize: 'xs',
    display: 'block',
    whiteSpace: 'nowrap',
  },
  variants: {
    imagePadding: {
      TRUE: {
        position: 'absolute',
        left: 0,
        top: '100%',
        mt: '1',
      },
      FALSE: {
        mt: '1',
        pl: '1',
        md: {
          position: 'absolute',
          bottom: '1',
          transform: 'rotate(-90deg)',
          transformOrigin: 'bottom left',
        },
      },
    },
    imagePosition: {
      LEFT: {},
      RIGHT: {},
    },
  },
  compoundVariants: [
    {
      imagePadding: 'FALSE',
      imagePosition: 'LEFT',
      css: {
        md: {
          left: 'calc(100% + 1lh + 0.25rem)',
        },
      },
    },
    {
      imagePadding: 'FALSE',
      imagePosition: 'RIGHT',
      css: {
        md: {
          left: '-1',
        },
      },
    },
  ],
  defaultVariants: {
    imagePadding: 'FALSE',
    imagePosition: 'LEFT',
  },
})

export function SplitTeaser({
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
      className={teaserStyle({
        imagePosition: teaser.imagePosition ?? 'LEFT',
        imagePadding: teaser.imagePadding ? 'TRUE' : 'FALSE',
      })}
      style={{
        color: teaser.color?.hex,
        backgroundColor: teaser.backgroundColor?.hex,
      }}
    >
      <div
        className={css({
          gridArea: 'image',
          position: 'relative',
          zIndex: 1, // place above the link overlay
        })}
      >
        <TeaserLargeImage
          data-sanity={dataAttribute({
            id: _id,
            type: _type,
            path: 'teaserLarge.image',
          })}
          image={teaser.image}
          className={css({
            display: 'block',
            width: '100%',
            height: 'auto',
          })}
          alt={''}
          sizes={'(max-width: 768px) 100vw, 50vw'}
        />

        {teaser.imageCredits && (
          <span
            className={imageCredits({
              imagePosition: teaser.imagePosition ?? 'LEFT',
              imagePadding: teaser.imagePadding ? 'TRUE' : 'FALSE',
            })}
          >
            {teaser.imageCredits}
          </span>
        )}
      </div>
      <div
        className={css({
          gridArea: 'content',
          padding: '8',
          display: 'flex',
          flexDirection: 'column',
          gap: '3',
          md: {
            padding: '0',
          },
        })}
        style={{
          textAlign: teaser.textAlignment === 'CENTER' ? 'center' : 'left',
        }}
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
