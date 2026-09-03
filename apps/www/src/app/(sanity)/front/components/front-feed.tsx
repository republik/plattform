import { FRONT_FEED_QUERY } from '@/app/(sanity)/groq/front-feed-query'
import { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { use } from 'react'
import { FrontFeedClient } from './front-feed-client'

const PAGE_SIZE = 20

export function FrontFeed() {
  async function fetchPage(offset: number): Promise<TeaserLargeFragmentType[]> {
    'use server'
    const { data } = await sanityFetch({
      query: FRONT_FEED_QUERY,
      params: {
        start: offset,
        end: offset + PAGE_SIZE,
      },
    })
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
