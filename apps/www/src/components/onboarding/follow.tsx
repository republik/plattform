import { SetOnboardedDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import { css } from '@republik/theme/css'
import { useEffect } from 'react'
import { useMe } from '../../../lib/context/MeContext'
import { useTranslation } from '../../../lib/withT'
import { Frame } from '../ui/containers'
import AuthorsSection from './authors-section'
import FormatsSection from './formats-section'
import OnboardingHeader, { OnboardingBackButton } from './onboarding-header'
import { OnboardingNextStep } from './onboarding-ui'
import PodcastsSection from './podcasts-section'

function OnboardingFollow() {
  const { t } = useTranslation()
  const { meLoading, me } = useMe()
  const [setOnboarded] = useMutation(SetOnboardedDocument)

  useEffect(() => {
    if (!meLoading && !me?.onboarded) {
      setOnboarded()
    }
  }, [meLoading, me, setOnboarded])

  return (
    <Frame>
      <div className={css({ px: 4, py: 6 })}>
        <OnboardingHeader>
          <div className={css({ display: 'flex', alignItems: 'center' })}>
            <OnboardingBackButton href='/onboarding/tipp-1' />
            <div>
              <h2>{t('onboarding/follow/step')}</h2>
              <h1>{t('onboarding/follow/title')}</h1>
            </div>
          </div>
          <p>{t('onboarding/follow/description')}</p>
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
