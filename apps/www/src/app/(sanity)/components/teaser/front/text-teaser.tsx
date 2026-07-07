import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { BylineShort } from '@/app/(sanity)/components/teaser/feed/helpers'
import type { TeaserBlockFragmentType } from '@/app/(sanity)/groq/teaser-block-fragment'
import { css, cva } from '@republik/theme/css'
import { stegaClean } from 'next-sanity'

type TeaserProps = TeaserBlockFragmentType['reference']

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

export function TextTeaser({ contributors, teaser }: TeaserProps) {
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
        <h2 className={teaserTitle({ size: stegaClean(teaser.textSize) })}>
          <InlinePortableText value={teaser.title} />
        </h2>
        <p className={teaserLead}>
          <InlinePortableText value={teaser.lead} />
        </p>
        {contributors && <BylineShort contributors={contributors} />}
      </div>
    </div>
  )
}
