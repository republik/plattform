'use client'

import FollowCollectionCard from '@/app/(sanity)/components/follow/follow-collection-card'
import FollowContributors from '@/app/(sanity)/components/follow/follow-contributors'
import { useMe } from '@/lib/context/MeContext' // order of priority:

// order of priority:
// subscribe to newsletter > follow collection > follow contributors
function FollowArticle({ contributors, collection }) {
  const { me, meLoading } = useMe()

  if (meLoading) return null

  /*if (newsletter) {
    return <NewsletterArticleCard newsletter={newsletter} />
  }*/

  if (!me) return null

  if (collection) {
    return <FollowCollectionCard collection={collection} />
  }

  return <FollowContributors contributors={contributors} />
}

export default FollowArticle
