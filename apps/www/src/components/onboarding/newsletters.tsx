import { NewsletterSettingsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { OnboardingNextStep } from '@app/components/onboarding/onboarding-ui'
import { css } from '@republik/theme/css'
import NewsletterSection from './newsletter-section'
import OnboardingHeader from './onboarding-header'

const FEATURED = ['DAILY', 'WDWWW', 'WEEKLY']
const MORE = ['CLIMATE', 'SUNDAY']

const matchSubscriptions = (nlList, subscriptions) =>
  nlList.map((nlName) => subscriptions.find((s) => s.name === nlName))

function Newsletters() {
  const { loading, data } = useQuery(NewsletterSettingsDocument)
  if (loading) return null

  const subscriptions = data?.me?.newsletterSettings?.subscriptions
  if (!subscriptions) return null

  const featuredSubscriptions = matchSubscriptions(FEATURED, subscriptions)
  const moreSubscriptions = matchSubscriptions(MORE, subscriptions)

  return (
    <>
      <div className={css({ p: 6 })}>
        <OnboardingHeader>
          <h2>Tipp 1 von 2</h2>
          <h1>Lassen Sie sich die Republik ins Postfach liefern</h1>
          <p>Welche Newsletter möchten Sie erhalten?</p>
        </OnboardingHeader>

        <NewsletterSection
          title='Beliebteste'
          subscriptions={featuredSubscriptions}
        />
        <NewsletterSection
          title='Was für Sie?'
          subscriptions={moreSubscriptions}
        />
      </div>

      <OnboardingNextStep onNextStep={() => undefined} />
    </>
  )
}

export default Newsletters
