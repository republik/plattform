'use client'

import { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { stegaClean } from 'next-sanity'
import { usePathname } from 'next/navigation'

export function Heading({ teaser }: { teaser: TeaserListItemType }) {
  const pathname = usePathname()

  if (!teaser?.heading) return null

  if (teaser._type === 'teaserSmall') {
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
      <h5 style={{ color: teaser.theme?.accentColor?.hex }}>
        {stegaClean(teaser.heading.title)}
      </h5>
    )
  }

  return null
}
