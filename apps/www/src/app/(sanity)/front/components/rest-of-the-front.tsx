import { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import {
  FRONT_REST_EXCLUDED_COLLECTIONS,
  FRONT_REST_QUERY,
} from '@/app/(sanity)/groq/front-rest-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { RestOfTheFrontClient } from './rest-of-the-front-client'

const PAGE_SIZE = 20

export async function RestOfTheFront({ before }: { before: string }) {
  if (!before) return null

  async function fetchPage(offset: number): Promise<TeaserListItemType[]> {
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
