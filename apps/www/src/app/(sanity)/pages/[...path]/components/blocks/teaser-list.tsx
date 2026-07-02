'use client'

import { feedTeaserFragment } from '@/app/(sanity)/components/teaser/feed'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { PageBuilderBlock } from '@/app/(sanity)/pages/[...path]/components/page-builder'
import { defineQuery } from 'next-sanity'
import { useState } from 'react'
import { TeaserFeed } from './teaser-feed'

const MAX_TEASERS = 20

// TODO: load first 20. Then more on click
// handle the teasers loading logic here
// delegate presentation to nested components
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
  const [showAll, setShowAll] = useState(false)
  const [teasers, setTeasers] = useState([])
  const { appearance, _key: blockKey } = block

  const { data } = await sanityFetch({
    query: PAGE_BUILDER_TEASER_LIST_BLOCK_QUERY,
    params: { documentId, blockKey, start: 0, end: MAX_TEASERS },
  })

  const { maxItems, total } = data.block
  setTeasers(data.block.teasers)

  async function loadAll() {
    const { data: more } = await sanityFetch({
      query: PAGE_BUILDER_TEASER_LIST_BLOCK_QUERY,
      params: { documentId, blockKey, start: MAX_TEASERS, end: total },
    })
    setTeasers(teasers.concat(more.block.teasers))
    setShowAll(true)
  }

  if (!data || !data.block) return null
  if (!teasers?.length) return null

  const shownTeasers = teasers.slice(0, maxItems ?? undefined)
  const showLoadMore = total > MAX_TEASERS && !showAll

  if (appearance === 'FEED') {
    return (
      <>
        <TeaserFeed teasers={shownTeasers} />
        {showLoadMore && <button onClick={() => loadAll()}>Load all</button>}
      </>
    )
  }

  return null
}
