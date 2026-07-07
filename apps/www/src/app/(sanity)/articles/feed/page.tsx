import FeedTeaser from '@/app/(sanity)/components/teaser/feed'
import { ARTICLES_QUERY } from '@/app/(sanity)/groq/articles-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { css } from '@republik/theme/css'
import { editorialContent } from '@republik/theme/recipes'

export default async function FeedPage() {
  const { data: articles } = await sanityFetch({
    query: ARTICLES_QUERY,
  })

  return (
    <div className={css({ my: '8' })}>
      <article className={editorialContent()}>
        <div>
          {articles.map((article, index) => (
            <FeedTeaser key={article._id} teaser={article} index={index} />
          ))}
        </div>
      </article>
    </div>
  )
}
