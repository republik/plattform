'use client'

import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { FeedTeaserFragmentType } from '@/app/(sanity)/groq/feed-teaser-fragment'
import { css } from '@republik/theme/css'

export function Carousel({
  teasers,
  maxItems,
}: {
  teasers: FeedTeaserFragmentType[]
  maxItems: number
}) {
  const shownTeasers = teasers.slice(0, maxItems ?? undefined)

  return (
    <div className={css({ mt: '16' })}>
      <h2 className={css({ textStyle: 'h1Sans', mb: '8' })}>CAROUSEL</h2>
      <ul>
        {shownTeasers.map((teaser, index) => (
          <li>
            <InlinePortableText value={teaser.title} />
          </li>
        ))}
      </ul>
    </div>
  )
}
