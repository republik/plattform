'use client'

import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { FeedTeaserType } from '@/app/(sanity)/components/teaser/feed/index'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { linkOverlay } from '@republik/theme/patterns'
import { stegaClean } from 'next-sanity'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function BylineShort({ teaser }: { teaser: FeedTeaserType }) {
  const authorsNames = teaser.contributors
    ?.filter((contributor) => contributor?.kind?.includes('Text'))
    .map((contributor) => contributor.name)

  if (!authorsNames?.length) return null

  return <p className='author'>Von {authorsNames.join(', ')}</p>
}

export function Heading({ teaser }: { teaser: FeedTeaserType }) {
  const pathname = usePathname()

  if (!teaser?.heading) return null

  // Don't repeat the heading when we're already on its page. The heading slug
  // matches the browser path directly (via rewrite) or under /pages.
  const headingPath = stegaClean(teaser.heading.slug?.current)
  if (
    headingPath &&
    (pathname === headingPath || pathname === `/pages${headingPath}`)
  ) {
    return null
  }

  return (
    <h5 style={{ color: teaser.theme?.accentColor?.hex }}>
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
