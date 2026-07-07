import { TEASER_FEED_QUERY } from '@/app/(sanity)/groq/teaser-feed-query'
import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { stegaClean } from 'next-sanity'
import { Carousel } from './carousel'
import { TeaserFeed } from './teaser-feed'

export const MAX_TEASERS = 20

export async function TeaserList({
  teaserList,
  documentId,
  blockKey,
}: {
  teaserList: TeaserListBlockFragmentType
  documentId: string
  blockKey: string
}) {
  const { data } = await sanityFetch({
    query: TEASER_FEED_QUERY,
    params: { documentId, blockKey, start: 0, end: MAX_TEASERS },
  })

  const teasers = data?.block?.teasers
  if (!teasers?.length) return null

  const { total, maxItems } = teaserList
  const appearance = stegaClean(teaserList.appearance)

  // we only offer this option when: list has > 20 teasers
  async function loadMore() {
    'use server'
    const { data } = await sanityFetch({
      query: TEASER_FEED_QUERY,
      params: { documentId, blockKey, start: MAX_TEASERS, end: total },
    })
    return data?.block?.teasers ?? []
  }

  // TODO: GRID

  if (appearance === 'FEED')
    return (
      <TeaserFeed
        initialTeasers={teasers}
        total={total}
        maxItems={maxItems}
        pageSize={MAX_TEASERS}
        loadMoreAction={loadMore}
      />
    )

  if (appearance === 'CAROUSEL')
    return <Carousel teasers={teasers} maxItems={maxItems} />

  return null
}
