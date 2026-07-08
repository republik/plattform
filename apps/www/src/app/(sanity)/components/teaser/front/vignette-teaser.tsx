import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { BylineShort } from '@/app/(sanity)/components/teaser/feed/helpers'
import type { TeaserBlockFragmentType } from '@/app/(sanity)/groq/teaser-block-fragment'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { css, cva } from '@republik/theme/css'
import { linkOverlay } from '@republik/theme/patterns'
import { getImageDimensions } from '@sanity/asset-utils'
import { stegaClean } from 'next-sanity'
import { Image } from 'next-sanity/image'
import Link from 'next/link'

type TeaserProps = TeaserBlockFragmentType['reference']

const teaserStyle = cva({
  base: {
    position: 'relative',
    padding: '30px 15px 40px 15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6',
    md: {
      padding: '60px 0',
    },
  },
  variants: {},

  defaultVariants: {},
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
  contributors,
  teaser,
}: TeaserProps) {
  const asset = teaser.image?.asset
  const { src, dimensions } = asset
    ? {
        src: urlFor(asset).url(),
        dimensions: getImageDimensions(asset),
      }
    : {}
  const href = _type === 'article' ? `/article${slug}` : `/page/${slug}`

  return (
    <div
      className={teaserStyle()}
      style={{ backgroundColor: teaser.backgroundColor?.hex }}
    >
      <div>
        {asset && (
          <Image
            className={imageStyle}
            src={src}
            alt={''}
            width={dimensions.width}
            height={dimensions.height}
            sizes={'(max-width: 768px) 100vw, 50vw'}
          />
        )}
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
          <h2 className={teaserTitle({ size: stegaClean(teaser.textSize) })}>
            <InlinePortableText value={teaser.title} />
          </h2>
        </Link>
        <p className={teaserLead}>
          <InlinePortableText value={teaser.lead} />
        </p>
        {contributors && <BylineShort contributors={contributors} />}
      </div>
    </div>
  )
}
