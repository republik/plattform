'use client'

import { SetOnboardedDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import NewslettersOverview from '@app/components/newsletters/newsletters-overview'
import { NL_FEATURED, NL_MORE } from '@app/components/onboarding/config'
import { css } from '@republik/theme/css'
import { useEffect } from 'react'
import { useMe } from '../../../lib/context/MeContext'
import { useTranslation } from '../../../lib/withT'
import { Frame } from '../ui/containers'
import OnboardingHeader from './onboarding-header'
import { OnboardingNextStep } from './onboarding-next-step'

function OnboardingNewsletters() {
  const { t } = useTranslation()

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

        <NewslettersOverview nlFeatured={NL_FEATURED} nlMore={NL_MORE} />
      </div>

      <OnboardingNextStep href='/einrichten/folgen'>
        {t('onboarding/newsletters/next')}
      </OnboardingNextStep>
    </Frame>
  )
}

export default OnboardingNewsletters
