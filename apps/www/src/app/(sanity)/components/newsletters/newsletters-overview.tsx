import { NewsletterSettingsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { type NewsletterName } from '@/app/(sanity)/components/newsletters/config'
import { NewslettersStatus } from '@/app/(sanity)/components/newsletters/newsletters-status'
import { useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
import { NewsletterCourseCard } from './newsletters-card'
import NewslettersSection from './newsletters-section'

function NewslettersOverview({
  nlFeatured,
  nlMore,
  nlCourses,
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
      {nlFeatured?.length && (
        <NewslettersSection
          title='Beliebteste'
          newsletters={nlFeatured}
          subscriptions={subscriptions}
          disabled={data.me.newsletterSettings.status !== 'subscribed'}
        />
      )}
      {nlMore?.length && (
        <NewslettersSection
          title='Was für Sie?'
          newsletters={nlMore}
          subscriptions={subscriptions}
          disabled={data.me.newsletterSettings.status !== 'subscribed'}
        />
      )}
      {nlCourses?.length && (
        <NewslettersSection
          title='Kurse'
          newsletters={nlCourses}
          CardComponent={NewsletterCourseCard}
        />
      )}
    </>
  )
}

export default NewslettersOverview;
