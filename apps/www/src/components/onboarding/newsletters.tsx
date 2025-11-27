import {
  NewsletterSettingsDocument,
  NewsletterSubscription,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
import { Frame } from '../ui/containers'
import { NL_FEATURED, NL_MORE } from './config'
import NewsletterSection from './newsletter-section'
import OnboardingHeader from './onboarding-header'
import { OnboardingNextStep } from './onboarding-ui'

function OnboardingNewsletters() {
  const { data } = useQuery(NewsletterSettingsDocument)
  const subscriptions = data?.me?.newsletterSettings
    ?.subscriptions as NewsletterSubscription[]

  return (
    <Frame>
      <div className={css({ p: 6 })}>
        <OnboardingHeader>
          <h2>Tipp 1 von 2</h2>
          <h1>Lassen Sie sich die Republik ins Postfach liefern</h1>
          <p>Welche Newsletter möchten Sie erhalten?</p>
        </OnboardingHeader>

        <NewsletterSection
          title='Beliebteste'
          newsletters={NL_FEATURED}
          subscriptions={subscriptions}
        />
        <NewsletterSection
          title='Was für Sie?'
          newsletters={NL_MORE}
          subscriptions={subscriptions}
        />
      </div>

      <OnboardingNextStep href='/onboarding/tipp-2'>Weiter</OnboardingNextStep>
    </Frame>
  )
}

export default OnboardingNewsletters
