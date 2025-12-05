import {
  NewsletterSettingsDocument,
  NewsletterSubscription,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
import { useTranslation } from '../../../lib/withT'
import { Frame } from '../ui/containers'
import { NL_FEATURED, NL_MORE } from './config'
import NewsletterSection from './newsletter-section'
import OnboardingHeader from './onboarding-header'
import { OnboardingNextStep } from './onboarding-ui'

function OnboardingNewsletters() {
  const { t } = useTranslation()
  const { data } = useQuery(NewsletterSettingsDocument)
  const subscriptions = data?.me?.newsletterSettings
    ?.subscriptions as NewsletterSubscription[]

  return (
    <Frame>
      <div className={css({ p: 6 })}>
        <OnboardingHeader>
          <h2>{t('onboarding/newsletters/step')}</h2>
          <h1>{t('onboarding/newsletters/title')}</h1>
          <p>{t('onboarding/newsletters/description')}</p>
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

      <OnboardingNextStep href='/onboarding/tipp-2'>
        {t('onboarding/newsletters/next')}
      </OnboardingNextStep>
    </Frame>
  )
}

export default OnboardingNewsletters
