import { FEED_BLOCK_QUERY } from '@/app/(sanity)/groq/feed-block-query'
import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { stegaClean } from 'next-sanity'
import { TeaserFeedClient } from './teaser-feed-client'

export const MAX_TEASERS = 20

export async function TeaserFeedServer({
  teaserList,
  documentId,
  blockKey,
}: {
  teaserList: TeaserListBlockFragmentType
  documentId: string
  blockKey: string
}) {
  const { data } = await sanityFetch({
    query: FEED_BLOCK_QUERY,
    params: { documentId, blockKey, start: 0, end: MAX_TEASERS },
  })

  const teasers = data?.block?.teasers
  if (!teasers?.length) return null

  const { total, maxItems, title } = teaserList
  const appearance = stegaClean(teaserList.appearance)

  // we only offer this option when: list has > 20 teasers
  async function loadMore() {
    'use server'
    const { data } = await sanityFetch({
      query: FEED_BLOCK_QUERY,
      params: { documentId, blockKey, start: MAX_TEASERS, end: total },
    })
    return data?.block?.teasers ?? []
  }

  return (
    <TeaserFeedClient
      initialTeasers={teasers}
      total={total}
      maxItems={maxItems}
      pageSize={MAX_TEASERS}
      loadMoreAction={loadMore}
      title={title}
    />
  )
}
