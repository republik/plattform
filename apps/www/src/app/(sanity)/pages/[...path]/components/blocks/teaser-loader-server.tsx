// NOTE: deliberately no file-level 'use server' — that would turn every
// exported async function (including the component) into a publicly callable
// Server Action with attacker-controlled arguments. Only `loadMore` is an
// action, via its inline directive.
import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { TEASERS_QUERY_ASC, TEASERS_QUERY_DESC } from '@/app/(sanity)/groq/teasers-query'
import { UPCOMING_TEASERS_QUERY } from '@/app/(sanity)/groq/upcoming-teasers-query'
import { draftsClient } from '@/app/(sanity)/lib/drafts-client'
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

  const upcomingTeasers =
    teaserList.series && teaserList.collectionId
      ? await draftsClient.fetch(UPCOMING_TEASERS_QUERY, {
          collectionId: teaserList.collectionId,
        })
      : []

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
      upcomingTeasers={upcomingTeasers}
      teaserList={teaserList}
      pageSize={MAX_TEASERS}
      loadMoreAction={loadMore}
    />
  )
}
