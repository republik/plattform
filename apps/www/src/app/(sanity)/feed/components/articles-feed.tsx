import { ARTICLES_QUERY } from '@/app/(sanity)/groq/articles-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { stegaClean } from 'next-sanity'
import {
  ArticlesFeedClient,
  type FeedCursor,
  type FeedPage,
} from './articles-feed-client'

const INITIAL_SIZE = 40
const PAGE_SIZE = 20

export async function ArticlesFeed() {
  async function fetchPage(cursor?: FeedCursor): Promise<FeedPage> {
    'use server'

    const size = cursor ? PAGE_SIZE : INITIAL_SIZE

    const { data } = await sanityFetch({
      query: ARTICLES_QUERY,
      params: {
        lastPublishDate: cursor?.publishDate ?? null,
        lastId: cursor?.id ?? null,
        limit: size + 1,
      },
    })

    const rows = data ?? []
    const teasers = rows.slice(0, size)
    const last = teasers.at(-1)

    return {
      teasers,
      hasMore: rows.length > size,
      cursor: last?.publishDate
        ? { publishDate: stegaClean(last.publishDate), id: last._id }
        : undefined,
    }
  }

  const initialPage = await fetchPage()
  if (!initialPage.teasers.length) return null

  return (
    <ArticlesFeedClient initialPage={initialPage} loadMoreAction={fetchPage} />
  )
}
