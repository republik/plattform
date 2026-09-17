import { FRONT_FEED_QUERY } from '@/app/(sanity)/groq/front-feed-query'
import { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { client } from '@/app/(sanity)/lib/client'
import { use } from 'react'
import { FrontFeedClient } from './front-feed-client'

const PAGE_SIZE = 20

export function FrontFeed() {
  async function fetchPage(offset: number): Promise<TeaserLargeFragmentType[]> {
    'use server'
    const data = await client.fetch(
      FRONT_FEED_QUERY,
      {
        start: offset,
        end: offset + PAGE_SIZE,
      },
      { tag: 'front-feed' },
    )
    return data ?? []
  }

  const initialTeasers = use(fetchPage(0))

  if (!initialTeasers.length) return null

  return (
    <FrontFeedClient
      initialTeasers={initialTeasers}
      pageSize={PAGE_SIZE}
      loadMoreAction={fetchPage}
    />
  )
}
