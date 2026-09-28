'use client'

import { hasContent } from '@/app/(sanity)/components/portable-text/helpers/hasContent'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { LinkOverlay } from '@/app/(sanity)/components/teaser/_shared/link-overlay'
import { TeaserImage } from '@/app/(sanity)/components/teaser/_shared/teaser-image'
import { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@/app/lib/analytics/event-tracking'
import { useTranslation } from '@/lib/withT'
import { css, cx } from '@republik/theme/css'
import { useEffect } from 'react'
import {
  nextReadHeader,
  nextReadItemTypography,
  nextReadsSection,
} from './styles'

type ColorType = {
  color: string
  background: string
}

const COLOURS: ColorType[] = [
  { color: '#FCFBE8', background: '#317D7F' },
  { color: '#201E1E', background: '#E2D334' },
  { color: '#FF7CE7', background: '#431D32' },
  { color: '#CA003C', background: '#BCCEDE' },
]

const MD_WIDTH = 650
const MD_HEIGHT = (MD_WIDTH * 4) / 3

export function MostCommentedFeedClient({
  teasers,
}: {
  teasers: TeaserListItemType[]
}) {
  const { t } = useTranslation()

  if (!teasers.length) return null

  return (
    <EventTrackingContext category='NextReads:MostCommentedFeed'>
      <div className={nextReadsSection}>
        <div className={nextReadHeader}>
          <h3>{t('nextReads/mostCommentedFeed/title')}</h3>
          <p className='tagline'>{t('nextReads/mostCommentedFeed/subtitle')}</p>
        </div>
      </div>
      <MostCommentedGrid teasers={teasers} />
    </EventTrackingContext>
  )
}

const mostCommentedGrid = css({
  maxWidth: '3270px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateRows: 'auto',
  gridTemplateColumns: '1fr',
  gap: 1,
  mb: 1,
  mt: 12,
  textAlign: 'center',
  md: {
    gridTemplateColumns: 'repeat(6, 1fr)',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
  },
})

function MostCommentedGrid({ teasers }: { teasers: TeaserListItemType[] }) {
  const trackEvent = useTrackEvent()

  useEffect(() => {
    trackEvent({
      action: 'is showing',
    })
  }, [trackEvent])

  return (
    <div className={mostCommentedGrid}>
      {teasers.map((teaser, index) => (
        <MostCommentedRead key={teaser._id} teaser={teaser} index={index} />
      ))}
    </div>
  )
}

function hasImage(teaser: TeaserListItemType): boolean {
  return !!teaser.image?.asset
}

function MostCommentedRead({
  teaser,
  index,
}: {
  teaser: TeaserListItemType
  index: number
}) {
  return (
    <div
      className={css({
        position: 'relative',
        scrollSnapAlign: 'start',
      })}
    >
      {hasImage(teaser) ? (
        <MostCommentedWithImage teaser={teaser} />
      ) : (
        <MostCommentedWithoutImage teaser={teaser} index={index} />
      )}
    </div>
  )
}

function MostCommentedCoverText({ teaser }: { teaser: TeaserListItemType }) {
  return (
    <div
      className={cx(
        nextReadItemTypography,
        css({
          pt: 4,
          width: '90%',
          ml: '5%',
        }),
      )}
    >
      <h4>
        <span className={css({ fontSize: 24, md: { fontSize: 32 } })}>
          <LinkOverlay teaser={teaser} />
        </span>
      </h4>
      {!hasImage(teaser) && hasContent(teaser.description) && (
        <p className='description'>
          <InlinePortableText value={teaser.description} />
        </p>
      )}
      {hasContent(teaser.byline) && (
        <p className='author'>
          <InlinePortableText value={teaser.byline} />
        </p>
      )}
    </div>
  )
}

function MostCommentedWithImage({ teaser }: { teaser: TeaserListItemType }) {
  return (
    <div
      className={css({
        width: '100%',
        aspectRatio: '9/16',
        display: 'flex',
        alignItems: 'end',
        position: 'relative',
        backgroundColor: 'background.marketing',
        md: { width: MD_WIDTH, aspectRatio: '3/4' },
      })}
    >
      <div
        className={css({
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          // stretch the image over the whole cover (overrides its intrinsic size)
          '& img': {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          },
        })}
      >
        <TeaserImage
          image={teaser.image}
          alt=''
          width={MD_WIDTH}
          height={MD_HEIGHT}
          loading='lazy'
        />
      </div>
      <div
        className={css({
          zIndex: 1,
          width: '100%',
          paddingBottom: 16,
          color: 'white',
          background:
            'linear-gradient(180deg, rgba(7, 7, 7, 0.00) 0%, #070707 100%)',
          // backdropFilter: 'blur(1px)', -> messes the stacking context and breaks linkOverlay (FF)
        })}
      >
        <MostCommentedCoverText teaser={teaser} />
      </div>
    </div>
  )
}

function MostCommentedWithoutImage({
  teaser,
  index,
}: {
  teaser: TeaserListItemType
  index: number
}) {
  const { color, background } = COLOURS[index % COLOURS.length]

  return (
    <div
      style={{
        backgroundColor: background,
        color: color,
      }}
      className={css({
        aspectRatio: '9/16',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        md: {
          aspectRatio: '3/4',
          width: MD_WIDTH,
        },
      })}
    >
      <div className={css({ pl: 4, pr: 4 })}>
        <MostCommentedCoverText teaser={teaser} />
      </div>
    </div>
  )
}
