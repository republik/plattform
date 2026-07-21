import {
  FRONT_REST_EXCLUDED_COLLECTIONS,
  FRONT_REST_QUERY,
} from '@/app/(sanity)/groq/front-rest-query'
import { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { RestOfTheFrontClient } from './rest-of-the-front-client'

const PAGE_SIZE = 20

export async function RestOfTheFront({ before }: { before: string }) {
  async function fetchPage(offset: number): Promise<TeaserLargeFragmentType[]> {
    'use server'
    const { data } = await sanityFetch({
      query: FRONT_REST_QUERY,
      params: {
        before,
        excludedCollections: FRONT_REST_EXCLUDED_COLLECTIONS,
        start: offset,
        end: offset + PAGE_SIZE,
      },
    })
    return data ?? []
  }

  const initialTeasers = await fetchPage(0)
  if (!initialTeasers.length) return null

  return (
    <RestOfTheFrontClient
      initialTeasers={initialTeasers}
      pageSize={PAGE_SIZE}
      loadMoreAction={fetchPage}
    />
  )
}
