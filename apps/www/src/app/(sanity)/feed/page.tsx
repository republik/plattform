import { ArticlesFeed } from '@/app/(sanity)/feed/components/articles-feed'
import { ForceOnboarding } from '@/app/components/onboarding/force-onboarding'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { editorialContent } from '@republik/theme/recipes'

export default function FeedPage() {
  return (
    <EventTrackingContext category='Feed'>
      <ForceOnboarding />
      <div className={css({ my: '8' })}>
        <article className={editorialContent()}>
          <div>
            <ArticlesFeed />
          </div>
        </article>
      </div>
    </EventTrackingContext>
  )
}
