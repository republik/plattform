import { getNotExpiredTeasers } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { TEASERS_SMALL_QUERY_DESC } from '@/app/(sanity)/groq/teasers-small-query'
import { sanityClientFetch } from '@/app/(sanity)/lib/fetch'
import { TeaserFeedClient, type TeaserFeedPage } from './teaser-feed-client'

const PAGE_SIZE = 20

export async function TeaserFeedServer({
  teaserList,
  documentId,
  blockKey,
}: {
  teaserList: TeaserListBlockFragmentType
  documentId: string
  blockKey: string
}) {
  const { total } = teaserList

  // the cursor is the position in the source list (incl. expired teasers)
  async function fetchPage(cursor = 0): Promise<TeaserFeedPage> {
    'use server'
    const end = cursor + PAGE_SIZE
    const data = await sanityClientFetch(
      TEASERS_SMALL_QUERY_DESC,
      {
        documentId,
        blockKey,
        start: cursor,
        end,
      },
      { tag: 'teaser-feed' },
    )
    const hasMore = end < total
    return {
      teasers: getNotExpiredTeasers(data?.block?.teasers),
      hasMore,
      cursor: hasMore ? end : undefined,
    }
  }

  const initialPage = await fetchPage()
  if (!initialPage.teasers.length) return null

  return (
    <TeaserFeedClient
      initialPage={initialPage}
      teaserList={teaserList}
      loadMoreAction={fetchPage}
    />
  )
}
