import { Document } from '#graphql/republik-api/__generated__/gql/graphql'
import { useTrackEvent } from '@app/lib/analytics/event-tracking'
import { linkOverlay } from '@republik/theme/patterns'
import Link from 'next/link'
import React from 'react'

export const getAuthors = (
  contributors: Array<{ kind?: string; name: string }> = [],
) =>
  'Von ' +
  contributors
    .filter((contributor) => contributor.kind?.includes('Text'))
    .map((contributor) => contributor.name)
    .join(', ')

export function CategoryLabel({ document }: { document: Document }) {
  const text = document.meta.format?.meta.title || document.meta.series?.title
  if (!text) return null
  return (
    <h5
      style={{
        color:
          document.meta.format?.meta.color ||
          document.meta.format?.meta.section?.meta.color,
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
  document: Document
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
