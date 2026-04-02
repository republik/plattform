import { NewsletterSettingsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import {
  type NewsletterName,
  NL_COURSES,
  NL_FEATURED,
  NL_MORE,
} from '@app/components/newsletters/config'
import { css } from '@republik/theme/css'
import NewslettersSection from './newsletters-section'
import { NewslettersStatus } from './newsletters-status'

function NewslettersOverview({
  nlFeatured = NL_FEATURED,
  nlMore = NL_MORE,
  nlCourses = NL_COURSES,
}: {
  nlFeatured?: NewsletterName[]
  nlMore?: NewsletterName[]
  nlCourses?: NewsletterName[]
}) {
  const { data } = useQuery(NewsletterSettingsDocument)

  if (!data?.me) {
    return null
  }

  const subscriptions = data.me.newsletterSettings.subscriptions

  return (
    <>
      <div className={css({ mb: '16' })}>
        <NewslettersStatus
          userId={data.me.id}
          status={data.me.newsletterSettings.status}
        />
      </div>
      <NewslettersSection
        title='Beliebteste'
        newsletters={nlFeatured}
        subscriptions={subscriptions}
        disabled={data.me.newsletterSettings.status !== 'subscribed'}
      />
      <NewslettersSection
        title='Was für Sie?'
        newsletters={nlMore}
        subscriptions={subscriptions}
        disabled={data.me.newsletterSettings.status !== 'subscribed'}
      />
      <NewslettersSection
        title='Kurse'
        newsletters={nlCourses}
        subscriptions={subscriptions}
        disabled={data.me.newsletterSettings.status !== 'subscribed'}
      />
    </>
  )
}

export default NewslettersOverview
