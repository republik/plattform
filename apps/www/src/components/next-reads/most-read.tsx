import { NextReadDocumentFieldsFragment } from '#graphql/republik-api/__generated__/gql/graphql'
import { SquareCover } from '@app/components/assets/SquareCover'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { css, cx } from '@republik/theme/css'
import React, { useEffect } from 'react'
import { useTranslation } from '../../../lib/withT'
import { CategoryLabel, NextReadAuthor, NextReadLink } from './helpers'
import { NextReadsLoader } from './loading'
import {
  nextReadHeader,
  nextReadItemTypography,
  nextReadsSection,
} from './styles'

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

function MostReadItem({
  document,
  index,
}: {
  document: NextReadDocumentFieldsFragment
  index: number
}) {
  return (
    <div className={cx(nextReadItemTypography, mostReadItemStyle)}>
      <div className={css({ marginBottom: 6 })}>
        <SquareCover
          size={312}
          title={document.meta.title}
          cover={document.meta.audioCover}
          crop={document.meta.audioCoverCrop}
          image={document.meta.image}
        />
      </div>
      <CategoryLabel document={document} />
      <h4>
        <NextReadLink document={document} index={index} />
      </h4>
      <p className='description'>{document.meta.description}</p>
      <NextReadAuthor document={document} />
    </div>
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

function MostReadGrid({
  documents,
}: {
  documents: NextReadDocumentFieldsFragment[]
}) {
  const trackEvent = useTrackEvent()

  useEffect(() => {
    trackEvent({
      action: 'is showing',
    })
  }, [trackEvent])

  return (
    <div className={mostReadGrid}>
      {documents.map((document, index) => (
        <MostReadItem key={document.id} document={document} index={index} />
      ))}
    </div>
  )
}

export function MostReadFeed({
  documents,
  loading,
}: {
  documents: NextReadDocumentFieldsFragment[] | undefined
  loading: boolean
}) {
  const { t } = useTranslation()

  if (!loading && !documents?.length) return null

  return (
    <EventTrackingContext category='NextReads:MostReadFeed'>
      <div className={nextReadsSection}>
        <div className={nextReadHeader}>
          <h3>{t('nextReads/mostReadFeed/title')}</h3>
          <p className='tagline'>{t('nextReads/mostReadFeed/subtitle')}</p>
        </div>
        {loading ? <NextReadsLoader /> : <MostReadGrid documents={documents} />}
      </div>
    </EventTrackingContext>
  )
}
