'use server'

import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { TEASERS_SMALL_QUERY_DESC } from '@/app/(sanity)/groq/teasers-small-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { TeaserFeedClient } from './teaser-feed-client'

const MAX_TEASERS = 20

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
    query: TEASERS_SMALL_QUERY_DESC,
    params: {
      documentId,
      blockKey,
      start: 0,
      end: MAX_TEASERS,
    },
  })

  const teasers = data?.block?.teasers
  if (!teasers?.length) return null

  const { total } = teaserList

  // we only offer this option when: list has > 20 teasers
  async function loadMore() {
    'use server'
    const { data } = await sanityFetch({
      query: TEASERS_SMALL_QUERY_DESC,
      params: { documentId, blockKey, start: MAX_TEASERS, end: total },
    })
    return data?.block?.teasers ?? []
  }

  return (
    <TeaserFeedClient
      initialTeasers={teasers}
      teaserList={teaserList}
      pageSize={MAX_TEASERS}
      loadMoreAction={loadMore}
    />
  )
}
