'use client'

import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { linkOverlay } from '@republik/theme/patterns'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Heading({ teaser }: { teaser: TeaserFragmentType }) {
  const pathname = usePathname()

  // we only show the heading for articles, not pages
  if (!teaser?.heading) return null

  if (teaser._type != 'article') return null

  // Don't display the heading when we're already on the correct page. The heading slug
  // matches the browser path directly (via rewrite) or under /pages.
  const headingPath = teaser.heading.slug

  if (
    headingPath &&
    (pathname === headingPath || pathname === `/pages${headingPath}`)
  ) {
    return null
  }

  return (
    <h5 style={{ color: teaser.theme?.accentColor?.hex }}>
      {teaser.heading.title}
    </h5>
  )
}

export function LinkOverlay({ teaser }: { teaser: TeaserFragmentType }) {
  const trackEvent = useTrackEvent()

  const href =
    teaser._type === 'article'
      ? `/articles${teaser.slug}`
      : `/pages${teaser.slug}`

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
