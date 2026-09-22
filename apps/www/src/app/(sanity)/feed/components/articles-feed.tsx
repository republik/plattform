import { ARTICLES_QUERY } from '@/app/(sanity)/groq/articles-query'
import { sanityClientFetch } from '@/app/(sanity)/lib/fetch'
import { stegaClean } from 'next-sanity'
import {
    ArticlesFeedClient,
    type FeedCursor,
    type FeedPage,
} from './articles-feed-client'

const SIZE = 20

export async function ArticlesFeed() {
  async function fetchPage(cursor?: FeedCursor): Promise<FeedPage> {
    'use server'

    const data = await sanityClientFetch(
      ARTICLES_QUERY,
      {
        lastPublishDate: cursor?.publishDate ?? null,
        lastId: cursor?.id ?? null,
        limit: SIZE + 1,
      },
      { tag: 'articles-feed' },
    )

    const rows = data ?? []
    const teasers = rows.slice(0, SIZE)
    const last = teasers.at(-1)

    return {
      teasers,
      hasMore: rows.length > SIZE,
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
