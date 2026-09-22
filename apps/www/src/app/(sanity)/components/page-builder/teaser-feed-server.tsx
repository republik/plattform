'use server'

import { getNotExpiredTeasers } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { TEASERS_SMALL_QUERY_DESC } from '@/app/(sanity)/groq/teasers-small-query'
import { sanityClientFetch } from '@/app/(sanity)/lib/fetch'
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
  const data = await sanityClientFetch(
    TEASERS_SMALL_QUERY_DESC,
    {
      documentId,
      blockKey,
      start: 0,
      end: MAX_TEASERS,
    },
    { tag: 'teaser-feed' },
  )

  const teasers = getNotExpiredTeasers(data?.block?.teasers)
  if (!teasers.length) return null

  const { total } = teaserList

  // we only offer this option when: list has > 20 teasers
  async function loadMore() {
    'use server'
    const data = await sanityClientFetch(
      TEASERS_SMALL_QUERY_DESC,
      {
        blockKey,
        start: MAX_TEASERS,
        end: total,
      },
      { tag: 'teaser-feed' },
    )
    return getNotExpiredTeasers(data?.block?.teasers)
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
