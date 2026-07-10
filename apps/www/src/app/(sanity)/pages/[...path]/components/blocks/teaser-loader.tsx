import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { TEASERS_QUERY } from '@/app/(sanity)/groq/teasers-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { TeaserGrid } from '@/app/(sanity)/pages/[...path]/components/blocks/teaser-grid'
import { stegaClean } from 'next-sanity'
import { TeaserFeed } from './teaser-feed'

export const MAX_TEASERS = 24

export async function TeaserLoader({
  teaserList,
  documentId,
  blockKey,
}: {
  teaserList: TeaserListBlockFragmentType
  documentId: string
  blockKey: string
}) {
  const { data } = await sanityFetch({
    query: TEASERS_QUERY,
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
      query: TEASERS_QUERY,
      params: { documentId, blockKey, start: MAX_TEASERS, end: total },
    })
    return data?.block?.teasers ?? []
  }

  if (appearance === 'FEED')
    return (
      <TeaserFeed
        initialTeasers={teasers}
        total={total}
        maxItems={maxItems}
        pageSize={MAX_TEASERS}
        loadMoreAction={loadMore}
        title={title}
      />
    )

  if (appearance === 'GRID')
    return (
      <TeaserGrid
        initialTeasers={teasers}
        total={total}
        maxItems={maxItems}
        pageSize={MAX_TEASERS}
        loadMoreAction={loadMore}
        title={title}
      />
    )
}
