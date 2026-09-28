import { fetchTeasersByIds } from '@/app/(sanity)/components/next-reads/fetch-teasers'
import { MostReadFeedClient } from '@/app/(sanity)/components/next-reads/most-read-client'

export async function MostReadFeed({ ids }: { ids: string[] }) {
  const teasers = await fetchTeasersByIds(ids)

  return <MostReadFeedClient teasers={teasers} />
}
