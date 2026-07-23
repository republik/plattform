'use client'

import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { linkOverlay } from '@republik/theme/patterns'
import { stegaClean } from 'next-sanity'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Heading({ teaser }: { teaser: TeaserListItemType }) {
  const pathname = usePathname()

  if (!teaser?.heading) return null

  if (teaser._type === 'teaser') {
    return (
      <h5 style={{ color: teaser.headingColor?.hex }}>
        {stegaClean(teaser.heading.title)}
      </h5>
    )
  }

  // we only show the heading for articles and teasers, not pages
  if (teaser._type === 'article') {
    // Don't display the heading when we're already on the correct page. The heading slug
    // matches the browser path directly (via rewrite) or under /pages.
    const headingPath = stegaClean(teaser.heading.slug)

    if (
      headingPath &&
      (pathname === headingPath || pathname === `/pages${headingPath}`)
    ) {
      return null
    }

    return (
      <h5 style={{ color: teaser.headingColor?.hex }}>
        {stegaClean(teaser.heading.title)}
      </h5>
    )
  }

  return null
}

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
