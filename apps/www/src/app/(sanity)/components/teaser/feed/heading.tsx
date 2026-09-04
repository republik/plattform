'use client'

import { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { stegaClean } from 'next-sanity'
import { usePathname } from 'next/navigation'

export function Heading({ teaser }: { teaser: TeaserListItemType }) {
  const pathname = usePathname()

  if (teaser._type === 'teaserSmall' && teaser.label) {
    return <h5 style={{ color: teaser.headingColor?.hex }}>{teaser.label}</h5>
  }

  // we only show the heading for articles and teasers, not pages
  if (teaser._type !== 'article') return null

  // if an article is part of a series, we show the series name in the feed
  if (teaser.articleCollection?.series) {
    return (
      <h5 style={{ color: teaser.theme?.accentColor?.hex }}>
        {teaser.articleCollection.title}
      </h5>
    )
  }

  if (!teaser.heading) return null

  // Don't display the heading when we're already on the correct page. The heading slug
  // matches the browser path directly (via rewrite) or under /pages.
  const headingPath = stegaClean(teaser.heading.slug)

  if (headingPath && pathname === headingPath) {
    return null
  }

  return (
    <h5 style={{ color: teaser.theme?.accentColor?.hex }}>
      {stegaClean(teaser.heading.title)}
    </h5>
  )
}
