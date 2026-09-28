import { BookmarkedFeedClient } from '@/app/(sanity)/components/next-reads/bookmarked-feed-client'
import { fetchTeasersByIds } from '@/app/(sanity)/components/next-reads/fetch-teasers'

export async function BookmarkedFeed({ ids }: { ids: string[] }) {
  const teasers = await fetchTeasersByIds(ids)

  return <BookmarkedFeedClient teasers={teasers} />
}
