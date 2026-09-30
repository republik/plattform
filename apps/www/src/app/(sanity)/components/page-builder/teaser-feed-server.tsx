import { getNotExpiredTeasers } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { TEASERS_SMALL_QUERY_DESC } from '@/app/(sanity)/groq/teasers-small-query'
import { sanityClientFetch } from '@/app/(sanity)/lib/fetch'
import { TeaserFeedClient } from './teaser-feed-client'

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
  // offset is the position in the source list (incl. expired teasers)
  async function fetchPage(offset: number) {
    'use server'
    const data = await sanityClientFetch(
      TEASERS_SMALL_QUERY_DESC,
      {
        documentId,
        blockKey,
        start: offset,
        end: offset + PAGE_SIZE,
      },
      { tag: 'teaser-feed' },
    )
    return getNotExpiredTeasers(data?.block?.teasers)
  }

  const teasers = await fetchPage(0)
  if (!teasers.length) return null

  return (
    <TeaserFeedClient
      initialTeasers={teasers}
      teaserList={teaserList}
      pageSize={PAGE_SIZE}
      loadMoreAction={fetchPage}
    />
  )
}
