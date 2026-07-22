import { ArticlesFeed } from '@/app/(sanity)/articles/feed/components/articles-feed'
import { css } from '@republik/theme/css'
import { editorialContent } from '@republik/theme/recipes'

export default function FeedPage() {
  return (
    <div className={css({ my: '8' })}>
      <article className={editorialContent()}>
        <div>
          <ArticlesFeed />
        </div>
      </article>
    </div>
  )
}
