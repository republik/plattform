'use client'

import {
  NewsletterSettingsDocument,
  NewsletterSubscription,
  SetOnboardedDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import { css } from '@republik/theme/css'
import { useEffect } from 'react'
import { useMe } from '../../../lib/context/MeContext'
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

  // whether the user has completes both onboarding steps or not, if they
  // open the newsletters step, we consider onboarding done
  const { meLoading, me } = useMe()
  const [setOnboarded] = useMutation(SetOnboardedDocument)

  useEffect(() => {
    if (!meLoading && !me?.onboarded) {
      setOnboarded().then()
    }
  }, [meLoading, me, setOnboarded])

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

      <OnboardingNextStep href='/einrichten/folgen'>
        {t('onboarding/newsletters/next')}
      </OnboardingNextStep>
    </Frame>
  )
}

export default OnboardingNewsletters
