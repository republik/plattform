import {
  NewsletterName,
  NewsletterSettingsDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { NL_FEATURED, NL_MORE } from '@app/components/newsletters/config'
import NewslettersSection from './newsletters-section'
import { NewslettersStatus } from './newsletters-status'

function NewslettersOverview({
  nlFeatured = NL_FEATURED,
  nlMore = NL_MORE,
}: {
  nlFeatured?: NewsletterName[]
  nlMore?: NewsletterName[]
}) {
  const { data } = useQuery(NewsletterSettingsDocument)

  if (!data?.me) {
    return null
  }

  const subscriptions = data.me.newsletterSettings.subscriptions

  return (
    <>
      <NewslettersStatus
        userId={data.me.id}
        status={data.me.newsletterSettings.status}
      />
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
    </>
  )
}

export default NewslettersOverview
