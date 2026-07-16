import FollowCollectionCard from '@/app/(sanity)/components/follow/follow-collection-card'
import FollowContributors from '@/app/(sanity)/components/follow/follow-contributors'
import NewsletterArticleCard from '@/app/(sanity)/components/newsletters/newsletter-article-card'
import { SeriesNav } from '@/app/(sanity)/components/portable-text/series-nav'
import type {
  ArticleCollection,
  ArticleContributor,
  ArticleNewsletter,
} from '@/app/(sanity)/lib/types'

// order of priority:
// subscribe to newsletter > follow collection > follow contributors
function FollowArticle({
  newsletter,
  collection,
  contributors,
  seriesId,
}: {
  newsletter: ArticleNewsletter
  collection: ArticleCollection
  contributors?: ArticleContributor[]
  seriesId?: string
}) {
  if (seriesId) {
    return (
      <SeriesNav
        value={{
          _type: 'seriesNav',
          series: { _type: 'reference', _ref: seriesId },
        }}
        compact
      />
    )
  }

  if (newsletter) {
    return <NewsletterArticleCard newsletter={newsletter} />
  }

  if (collection) {
    return <FollowCollectionCard collection={collection} />
  }

  return (
    <FollowContributors contributors={contributors?.filter((c) => c.slug)} />
  )
}

export default FollowArticle
