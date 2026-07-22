import {
  FRONT_FEED_EXCLUDED_COLLECTIONS,
  FRONT_FEED_QUERY,
} from '@/app/(sanity)/groq/front-feed-query'
import { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { FrontFeedClient } from './front-feed-client'

const PAGE_SIZE = 20

export async function FrontFeed({ before }: { before: string }) {
  async function fetchPage(offset: number): Promise<TeaserLargeFragmentType[]> {
    'use server'
    const { data } = await sanityFetch({
      query: FRONT_FEED_QUERY,
      params: {
        before,
        excludedCollections: FRONT_FEED_EXCLUDED_COLLECTIONS,
        start: offset,
        end: offset + PAGE_SIZE,
      },
    })
    return data ?? []
  }

  const initialTeasers = await fetchPage(0)
  if (!initialTeasers.length) return null

  return (
    <FrontFeedClient
      initialTeasers={initialTeasers}
      pageSize={PAGE_SIZE}
      loadMoreAction={fetchPage}
    />
  )
}
