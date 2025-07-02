import {
  Document,
  DocumentRecommendationsDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { css, cx } from '@republik/theme/css'
import React, { useEffect } from 'react'
import { useTranslation } from '../../../lib/withT'
import { CategoryLabel, getAuthors, NextReadLink } from './helpers'
import { NextReadsLoader } from './loading'
import {
  nextReadHeader,
  nextReadItemTypography,
  nextReadsSection,
} from './styles'

function RecommendedRead({
  document,
  index,
}: {
  document: Document
  index: number
}) {
  return (
    <div
      className={cx(
        nextReadItemTypography,
        css({
          pb: 8,
          mb: 8,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'divider',
          position: 'relative', // for the link overlay placement
          // exclude last item from border
          '&:last-of-type': { borderBottom: 'none', pb: 0 },
        }),
      )}
    >
      <CategoryLabel document={document} />
      <h4>
        <NextReadLink document={document} index={index} />
      </h4>
      <p className='description'>{document.meta.description}</p>
      <p className='author'>{getAuthors(document.meta.contributors)}</p>
    </div>
  )
}

function CuratedList({ documents }: { documents: Document[] }) {
  const trackEvent = useTrackEvent()

  useEffect(() => {
    trackEvent({
      action: 'is showing',
    })
  }, [trackEvent])

  return (
    <div className={css({ pt: 4, pb: 16 })}>
      {documents.map((document, index) => (
        <RecommendedRead key={document.id} document={document} index={index} />
      ))}
    </div>
  )
}

export function CuratedFeed({ path }: { path: string }) {
  const { t } = useTranslation()
  const { data, loading } = useQuery(DocumentRecommendationsDocument, {
    variables: { path },
  })

  const documents = data?.document.meta.recommendations?.nodes as Document[]

  if (!loading && !documents?.length) return null

  return (
    <EventTrackingContext category='NextReads:CuratedFeed'>
      <div
        className={css({
          margin: '0 auto',
          maxWidth: '695px',
          pl: '15px',
          pr: '15px',
        })}
      >
        <div className={nextReadsSection}>
          <div className={cx(nextReadHeader, css({ textAlign: 'left' }))}>
            <h3>{t('nextReads/curatedFeed/title')}</h3>
          </div>
        </div>
        {loading ? <NextReadsLoader /> : <CuratedList documents={documents} />}
      </div>
    </EventTrackingContext>
  )
}
