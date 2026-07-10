'use client'

import { TeaserFragmentType } from '@/app/(sanity)/groq/teaser-fragment'
import { stegaClean } from 'next-sanity'

export function BylineShort({
  contributors,
}: {
  contributors: TeaserFragmentType['contributors']
}) {
  const authorsNames = contributors
    ?.filter((contributor) => contributor?.kind?.includes('Text'))
    .map((contributor) => stegaClean(contributor.name))

  if (!authorsNames?.length) return null

  return <p className='author'>Von {authorsNames.join(', ')}</p>
}
