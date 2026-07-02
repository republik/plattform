import { feedTeaserFragment } from '@/app/(sanity)/components/teaser/feed'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { PageBuilderBlock } from '@/app/(sanity)/pages/[...path]/components/page-builder'
import { defineQuery } from 'next-sanity'
import { TeaserFeed } from './teaser-feed'

const MAX_TEASERS = 20

// TODO: load first 20. Then more on click
// handle the teasers loading logic here
// delegate presentation to nested components
export const PAGE_BUILDER_TEASER_LIST_BLOCK_QUERY = defineQuery(`
  *[_type == "page" && _id == $documentId][0]{
    "block": pageBuilder[_key == $blockKey][0]{
      maxItems,
      "teasers": select(
        source.sourceType == "MANUAL" => source.items[0...${MAX_TEASERS}]->{
          ${feedTeaserFragment}
        },
        source.sourceType == "COLLECTION" => *[
          _type == "article" &&
          ^.source.collection._ref in articleCollections[]._ref
        ] | order(publishDate desc) [0...${MAX_TEASERS}] {
          ${feedTeaserFragment}
        },
        []
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
    params: { documentId, blockKey },
  })

  if (!data || !data.block) return null

  const { maxItems, teasers } = data.block

  if (!teasers?.length) return null

  const shownTeasers = teasers.slice(0, maxItems ?? undefined)

  if (appearance === 'FEED') {
    return <TeaserFeed teasers={shownTeasers} />
  }

  return null
}
