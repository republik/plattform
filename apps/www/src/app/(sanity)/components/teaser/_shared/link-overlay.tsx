'use client'

import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { linkOverlay } from '@republik/theme/patterns'
import { stegaClean } from 'next-sanity'
import Link from 'next/link'

export function LinkOverlay({ teaser }: { teaser: TeaserListItemType }) {
  const trackEvent = useTrackEvent()

  const href =
    teaser._type === 'teaser'
      ? stegaClean(teaser.href)
      : teaser._type === 'article'
      ? `/articles${teaser.slug}`
      : `/pages${teaser.slug}`

  // standalone teasers may link nowhere
  if (!href) {
    return <InlinePortableText value={teaser.title} />
  }

  return (
    <Link
      href={href}
      className={linkOverlay()}
      onClick={() => {
        trackEvent({
          action: 'click teaser',
          slug: href,
        })
      }}
    >
      <InlinePortableText value={teaser.title} />
    </Link>
  )
}
