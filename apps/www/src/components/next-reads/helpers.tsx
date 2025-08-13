import { NextReadDocumentFieldsFragment } from '#graphql/republik-api/__generated__/gql/graphql'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { linkOverlay } from '@republik/theme/patterns'
import { token } from '@republik/theme/tokens'
import Link from 'next/link'
import React from 'react'

export function NextReadAuthor({
  document,
}: {
  document: NextReadDocumentFieldsFragment
}) {
  const authorsNames = document.meta.contributors
    .filter((contributor) => contributor.kind?.includes('Text'))
    .map((contributor) => contributor.name)

  if (authorsNames?.length === 0) return null

  return <p className='author'>Von {authorsNames.join(', ')}</p>
}

export function NextReadDuration({
  document,
}: {
  document: NextReadDocumentFieldsFragment
}) {
  const duration =
    document.meta.estimatedReadingMinutes ||
    document.meta.estimatedConsumptionMinutes

  if (!duration) return null

  return <p className='duration'>{duration} min</p>
}

export function CategoryLabel({
  document,
}: {
  document: NextReadDocumentFieldsFragment
}) {
  const text = document.meta.format?.meta.title || document.meta.series?.title
  if (!text) return null

  const color =
    document.meta.format?.meta.color ||
    document.meta.format?.meta.section?.meta.color

  return (
    <h5
      style={{
        // If the format color is set to black-ish, use a variable that works in dark mode
        color: color?.match(/^#(000|282828)/i) ? token('colors.text') : color,
      }}
    >
      {text}
    </h5>
  )
}

export function NextReadLink({
  document,
  index,
}: {
  document: NextReadDocumentFieldsFragment
  index?: number
}) {
  const trackEvent = useTrackEvent()

  return (
    <Link
      href={document.meta.path}
      className={linkOverlay()}
      onClick={() => {
        trackEvent({
          action: 'click recommended read',
          path: document.meta.path,
          index,
        })
      }}
    >
      {document.meta.title}
    </Link>
  )
}
