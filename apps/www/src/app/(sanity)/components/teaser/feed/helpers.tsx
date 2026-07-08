'use client'

import { FeedTeaserFragmentType } from '@/app/(sanity)/groq/feed-teaser-fragment'
import { stegaClean } from 'next-sanity'

export function BylineShort({
  contributors,
}: {
  contributors: FeedTeaserFragmentType['contributors']
}) {
  const authorsNames = contributors
    ?.filter((contributor) => contributor?.kind?.includes('Text'))
    .map((contributor) => stegaClean(contributor.name))

  if (!authorsNames?.length) return null

  return <p className='author'>Von {authorsNames.join(', ')}</p>
}
