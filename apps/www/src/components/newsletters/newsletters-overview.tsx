import {
  NewsletterName,
  NewsletterSettingsDocument,
  NewsletterSubscription,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import NewslettersSection from './newsletters-section'

function NewslettersOverview({
  nlFeatured,
  nlMore,
}: {
  nlFeatured: NewsletterName[]
  nlMore: NewsletterName[]
}) {
  const { data } = useQuery(NewsletterSettingsDocument)
  const subscriptions = data?.me?.newsletterSettings
    ?.subscriptions as NewsletterSubscription[]

  return (
    <>
      <NewslettersSection
        title='Beliebteste'
        newsletters={nlFeatured}
        subscriptions={subscriptions}
      />
      <NewslettersSection
        title='Was für Sie?'
        newsletters={nlMore}
        subscriptions={subscriptions}
      />
    </>
  )
}

export default NewslettersOverview
