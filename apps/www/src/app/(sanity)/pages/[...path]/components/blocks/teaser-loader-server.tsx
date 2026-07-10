'use server'

import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import {
  TEASERS_QUERY_ASC,
  TEASERS_QUERY_DESC,
} from '@/app/(sanity)/groq/teasers-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { TeaserLoaderClient } from './teaser-loader-client'

const MAX_TEASERS = 24

export async function TeaserLoaderServer({
  teaserList,
  documentId,
  blockKey,
}: {
  teaserList: TeaserListBlockFragmentType
  documentId: string
  blockKey: string
}) {
  // We display series in chronological order, starting with the first episode
  const QUERY = teaserList.series ? TEASERS_QUERY_ASC : TEASERS_QUERY_DESC

  const { data } = await sanityFetch({
    query: QUERY,
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
      query: QUERY,
      params: { documentId, blockKey, start: MAX_TEASERS, end: total },
    })
    return data?.block?.teasers ?? []
  }

  return (
    <TeaserLoaderClient
      initialTeasers={teasers}
      teaserList={teaserList}
      pageSize={MAX_TEASERS}
      loadMoreAction={loadMore}
    />
  )
}
