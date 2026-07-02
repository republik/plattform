import { feedTeaserFragment } from '@/app/(sanity)/components/teaser/feed'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { PageBuilderBlock } from '@/app/(sanity)/pages/[...path]/components/page-builder'
import { defineQuery } from 'next-sanity'
import { TeaserFeed } from './teaser-feed'

export const MAX_TEASERS = 20

const PAGE_BUILDER_TEASER_LIST_BLOCK_QUERY = defineQuery(`
  *[_type == "page" && _id == $documentId][0]{
    "block": pageBuilder[_key == $blockKey][0]{
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
  block,
  documentId,
}: {
  block: PageBuilderBlock
  documentId: string
}) {
  const { appearance, _key: blockKey } = block

  const { data } = await sanityFetch({
    query: PAGE_BUILDER_TEASER_LIST_BLOCK_QUERY,
    params: { documentId, blockKey, start: 0, end: MAX_TEASERS },
  })
  if (!data?.block) return null

  const { teasers, total, maxItems } = data.block
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
  
  if (appearance !== 'FEED') return null

  return (
    <TeaserFeed
      initialTeasers={teasers}
      total={total}
      maxItems={maxItems}
      pageSize={MAX_TEASERS}
      loadMoreAction={loadMore}
    />
  )
}
