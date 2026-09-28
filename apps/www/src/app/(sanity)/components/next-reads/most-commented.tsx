import { fetchTeasersByIds } from '@/app/(sanity)/components/next-reads/fetch-teasers'
import { MostCommentedFeedClient } from '@/app/(sanity)/components/next-reads/most-commented-client'

export async function MostCommentedFeed({ ids }: { ids: string[] }) {
  const teasers = await fetchTeasersByIds(ids)

  return <MostCommentedFeedClient teasers={teasers} />
}
