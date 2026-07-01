'use client'

import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { FeedTeaserType } from '@/app/(sanity)/components/teasers/feed/index'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { linkOverlay } from '@republik/theme/patterns'
import Link from 'next/link'

export function BylineShort({ teaser }: { teaser: FeedTeaserType }) {
  const authorsNames = teaser.contributors
    ?.filter((contributor) => contributor?.kind?.includes('Text'))
    .map((contributor) => contributor.name)

  if (!authorsNames?.length) return null

  return <p className='author'>Von {authorsNames.join(', ')}</p>
}

export function Heading({ teaser }: { teaser: FeedTeaserType }) {
  if (!teaser?.heading) return null

  // TODO: accent color
  return (
    <h5>
      <InlinePortableText value={teaser.heading.title} />
    </h5>
  )
}

export function LinkOverlay({
  teaser,
  index,
}: {
  teaser: FeedTeaserType
  index: number
}) {
  const trackEvent = useTrackEvent()

  return (
    <Link
      href={teaser.slug?.current ?? '#'}
      className={linkOverlay()}
      onClick={() => {
        trackEvent({
          action: 'click recommended read',
          slug: teaser.slug?.current,
          index,
        })
      }}
    >
      <InlinePortableText value={teaser.title} />
    </Link>
  )
}
