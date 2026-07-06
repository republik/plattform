import { feedTeaserFragment } from '@/app/(sanity)/components/teaser/feed'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { defineQuery, stegaClean } from 'next-sanity'
import { Carousel } from './carousel'
import { TeaserFeed } from './teaser-feed'

export const MAX_TEASERS = 20

const PAGE_BUILDER_TEASER_LIST_BLOCK_QUERY = defineQuery(`
  *[_type == "page" && _id == $documentId][0]{
    "block": pageBuilder[_key == $blockKey][0]{
      appearance,
      maxItems,
      "teasers": select(
        source.sourceType == "MANUAL" => source.items[$start...$end]->{
          ${feedTeaserFragment}
        },
        source.sourceType == "COLLECTION" => *[
          _type == "article" &&
          ^.source.collection._ref in articleCollections[]._ref
        ] | order(publishDate desc) [$start...$end] {
          ${feedTeaserFragment}
        },
        []
      ),
      "total": select(
        source.sourceType == "MANUAL" => count(source.items),
        source.sourceType == "COLLECTION" => count(*[
          _type == "article" &&
          ^.source.collection._ref in articleCollections[]._ref
        ]),
        0
      )
    }
  }
`)

export async function TeaserList({
  blockKey,
  documentId,
}: {
  blockKey: string
  documentId: string
}) {
  const { data } = await sanityFetch({
    query: PAGE_BUILDER_TEASER_LIST_BLOCK_QUERY,
    params: { documentId, blockKey, start: 0, end: MAX_TEASERS },
  })
  if (!data?.block) return null

  const { teasers, total, maxItems } = data.block
  const appearance = stegaClean(data.block.appearance)
  if (!teasers?.length) return null

  // we only offer this option when: list has > 20 teasers
  async function loadMore() {
    'use server'
    const { data } = await sanityFetch({
      query: PAGE_BUILDER_TEASER_LIST_BLOCK_QUERY,
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
