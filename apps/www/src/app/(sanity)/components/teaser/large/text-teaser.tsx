import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { TeaserAudioPlayButton } from '@/app/(sanity)/components/teaser/_shared/teaser-audio-play-button'
import { Heading } from '@/app/(sanity)/components/teaser/large/helpers'
import type { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { dataAttribute } from '@/app/(sanity)/lib/data-attribute'
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
      // `md` is left untouched here so MEDIUM/LARGE still grow through
      // `base.md` (100/110) first, matching legacy's `mUp` step, before
      // their own further growth at `lg`/`xlg` (legacy's `tUp`/`dUp` steps).
      LARGE: {
        lg: { fontSize: '125px', lineHeight: '137px' },
        xlg: { fontSize: '156px', lineHeight: '169px' },
      },
      MEDIUM: { lg: { fontSize: '125px', lineHeight: '137px' } },
      // Caps at the shared `base.md` step (100/110) — legacy TypoHeadline's
      // default never grows past `mUp`.
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
  _id,
  _type,
  target,
  targetId,
  publishDate,
  theme,
  teaser,
  heading,
}: TeaserLargeFragmentType) {
  const href = target ?? '#'

  return (
    <div
      data-sanity={dataAttribute({
        id: _id,
        type: _type,
        path: '/',
      })}
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
        {teaser.audioSourceMp3 && (
          <TeaserAudioPlayButton
            targetId={targetId}
            title={teaser.audioTitle}
            path={target}
            publishDate={publishDate}
            mp3={teaser.audioSourceMp3}
            durationMs={teaser.audioDurationMs}
            align='center'
          />
        )}
      </div>
    </div>
  )
}
