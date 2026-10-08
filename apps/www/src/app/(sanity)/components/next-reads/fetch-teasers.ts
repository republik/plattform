import { ARTICLES_BY_IDS_QUERY } from '@/app/(sanity)/groq/articles-by-ids-query'
import { sanityClientFetch } from '@/app/(sanity)/lib/fetch'

export async function fetchTeasersByIds(ids: string[]) {
  if (!ids.length) return []

  const teasers = await sanityClientFetch(
    ARTICLES_BY_IDS_QUERY,
    {
      ids,
    },
    { tag: 'next-reads' },
  )

  // ARTICLES_BY_IDS_QUERY returns documents in Sanity's own order; restore the
  // order of the given ids (e.g. most recently bookmarked or most read first).
  const teasersById = new Map(teasers.map((teaser) => [teaser._id, teaser]))
  return ids
    .map((id) => teasersById.get(id))
    .filter((teaser) => teaser !== undefined)
}
