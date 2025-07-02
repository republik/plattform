import { NextReadDocumentFieldsFragment } from '#graphql/republik-api/__generated__/gql/graphql'
import {
  EventTrackingContext,
  useTrackEvent,
} from '@app/lib/analytics/event-tracking'
import { css, cx } from '@republik/theme/css'
import React, { useEffect } from 'react'
import { useTranslation } from '../../../lib/withT'
import { getAuthors, NextReadLink } from './helpers'
import { NextReadsLoader } from './loading'
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

function MostCommentedCoverText({
  document,
  index,
}: {
  document: NextReadDocumentFieldsFragment
  index: number
}) {
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
          <NextReadLink document={document} index={index} />
        </span>
      </h4>
      {!document.meta.image && (
        <p className='description'>{document.meta.description}</p>
      )}
      <p className='author'>{getAuthors(document.meta.contributors)}</p>
    </div>
  )
}

function MostCommentedWithImage({
  document,
  index,
}: {
  document: NextReadDocumentFieldsFragment
  index: number
}) {
  return (
    <div
      className={css({
        width: '100%',
        aspectRatio: '9/16',
        display: 'flex',
        alignItems: 'end',
        position: 'relative',
        md: { width: MD_WIDTH, aspectRatio: '3/4' },
      })}
      style={{
        backgroundImage: `url(${document.meta.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className={css({
          width: '100%',
          paddingBottom: 16,
          color: 'white',
          background:
            'linear-gradient(180deg, rgba(7, 7, 7, 0.00) 0%, #070707 100%)',
          // backdropFilter: 'blur(1px)', -> messes the stacking context and breaks linkOverlay (FF)
        })}
      >
        <MostCommentedCoverText document={document} index={index} />
      </div>
    </div>
  )
}

function MostCommentedWithoutImage({
  document,
  index,
}: {
  document: NextReadDocumentFieldsFragment
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
          width: '650px',
        },
      })}
    >
      <div className={css({ pl: 4, pr: 4 })}>
        <MostCommentedCoverText document={document} index={index} />
      </div>
    </div>
  )
}

function MostCommentedRead({
  document,
  index,
}: {
  document: NextReadDocumentFieldsFragment
  index: number
}) {
  const Component = document.meta.image
    ? MostCommentedWithImage
    : MostCommentedWithoutImage

  return (
    <div
      className={css({
        position: 'relative',
        scrollSnapAlign: 'start',
      })}
    >
      <Component document={document} index={index} />
    </div>
  )
}

const mostCommentedGrid = css({
  maxWidth: '3270px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateRows: 'auto',
  gridTemplateColumns: '1',
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

function MostCommentedGrid({
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
    <div className={mostCommentedGrid}>
      {documents.map((document, index) => (
        <MostCommentedRead
          key={document.id}
          document={document}
          index={index}
        />
      ))}
    </div>
  )
}

export function MostCommentedFeed({
  documents,
  loading,
}: {
  documents: NextReadDocumentFieldsFragment[] | undefined
  loading: boolean
}) {
  const { t } = useTranslation()

  if (!loading && !documents?.length) return null

  return (
    <EventTrackingContext category='NextReads:MostCommentedFeed'>
      <div className={nextReadsSection}>
        <div className={nextReadHeader}>
          <h3>{t('nextReads/mostCommentedFeed/title')}</h3>
          <p className='tagline'>{t('nextReads/mostCommentedFeed/subtitle')}</p>
        </div>
      </div>
      {loading ? (
        <NextReadsLoader />
      ) : (
        <MostCommentedGrid documents={documents} />
      )}
    </EventTrackingContext>
  )
}
