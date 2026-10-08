'use client'

import { hasContent } from '@/app/(sanity)/components/portable-text/helpers/hasContent'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { LinkOverlay } from '@/app/(sanity)/components/teaser/_shared/link-overlay'
import { TeaserByline } from '@/app/(sanity)/components/teaser/_shared/teaser-byline'
import { TeaserImage } from '@/app/(sanity)/components/teaser/_shared/teaser-image'
import { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { Heading } from '@/app/(sanity)/components/teaser/feed/heading'
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

export function MostReadFeedClient({
  teasers,
}: {
  teasers: TeaserListItemType[]
}) {
  const { t } = useTranslation()

  if (!teasers.length) return null

  return (
    <EventTrackingContext category='NextReads:MostReadFeed'>
      <div className={nextReadsSection}>
        <div className={nextReadHeader}>
          <h3>{t('nextReads/mostReadFeed/title')}</h3>
          <p className='tagline'>{t('nextReads/mostReadFeed/subtitle')}</p>
        </div>
        <MostReadGrid teasers={teasers} />
      </div>
    </EventTrackingContext>
  )
}

const mostReadGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gridTemplateRows: 'auto',
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  gap: 0,
  mt: 12,
  pb: 8,
  md: {
    mx: 8,
    pb: 16,
  },
})

function MostReadGrid({ teasers }: { teasers: TeaserListItemType[] }) {
  const trackEvent = useTrackEvent()

  useEffect(() => {
    trackEvent({
      action: 'is showing',
    })
  }, [trackEvent])

  return (
    <div className={mostReadGrid}>
      {teasers.map((teaser) => (
        <MostReadItem key={teaser._id} teaser={teaser} />
      ))}
    </div>
  )
}

const mostReadItemStyle = css({
  textAlign: 'left',
  scrollSnapAlign: 'start',
  scrollSnapMarginLeft: '15px',
  width: '240px',
  position: 'relative', // for the link overlay placement
  mb: 4,
  px: 3,
  md: {
    px: 4,
  },
  lg: {
    width: 'auto',
    maxWidth: '312px',
  },
})

function MostReadItem({ teaser }: { teaser: TeaserListItemType }) {
  return (
    <div className={cx(nextReadItemTypography, mostReadItemStyle)}>
      <div className={css({ marginBottom: 6 })}>
        <TeaserImage
          image={teaser.image}
          alt=''
          width={312}
          height={312}
          fallback={true}
        />
      </div>
      <Heading teaser={teaser} />
      <h4>
        <LinkOverlay teaser={teaser} />
      </h4>
      {hasContent(teaser.description) && (
        <p className='description'>
          <InlinePortableText value={teaser.description} />
        </p>
      )}
      <TeaserByline teaser={teaser} skipPublishDate />
    </div>
  )
}
