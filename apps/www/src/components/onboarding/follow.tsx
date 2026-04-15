'use client'

import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { css } from '@republik/theme/css'
import { useTranslation } from '../../../lib/withT'
import { Frame } from '../ui/containers'
import AuthorsSection from './authors-section'
import FormatsSection from './formats-section'
import OnboardingHeader, { OnboardingBackButton } from './onboarding-header'
import { OnboardingNextStep } from './onboarding-next-step'
import PodcastsSection from './podcasts-section'

function OnboardingFollow() {
  const { t } = useTranslation()
  const { isNativeApp } = usePlatformInformation()

  return (
    <Frame>
      <div className={css({ px: 4, py: 6 })}>
        <OnboardingHeader>
          <div className={css({ display: 'flex', alignItems: 'center' })}>
            <OnboardingBackButton href='/einrichten' />
            <div>
              <h2>{t('onboarding/follow/step')}</h2>
              <h1>{t('onboarding/follow/title')}</h1>
            </div>
          </div>
          <p>
            {t(`onboarding/follow/${isNativeApp ? 'app' : 'web'}/description`)}
          </p>
        </OnboardingHeader>

        <FormatsSection />
        <AuthorsSection />
        <PodcastsSection />
      </div>

      <OnboardingNextStep href='/'>
        {t('onboarding/follow/next')}
      </OnboardingNextStep>
    </Frame>
  )
}

export default OnboardingFollow
