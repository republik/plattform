import { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
import { ARTICLES_QUERY } from '@/app/(sanity)/groq/articles-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { ArticlesFeedClient } from './articles-feed-client'

const INITIAL_SIZE = 100
const PAGE_SIZE = 20

export async function ArticlesFeed() {
  async function fetchPage(offset: number): Promise<TeaserSmallFragmentType[]> {
    'use server'
    // first page loads INITIAL_SIZE, then PAGE_SIZE per subsequent load
    const size = offset === 0 ? INITIAL_SIZE : PAGE_SIZE
    const { data } = await sanityFetch({
      query: ARTICLES_QUERY,
      params: { start: offset, end: offset + size },
    })
    return data ?? []
  }

  const initialTeasers = await fetchPage(0)
  if (!initialTeasers.length) return null

  return (
    <ArticlesFeedClient
      initialTeasers={initialTeasers}
      initialSize={INITIAL_SIZE}
      pageSize={PAGE_SIZE}
      loadMoreAction={fetchPage}
    />
  )
}
