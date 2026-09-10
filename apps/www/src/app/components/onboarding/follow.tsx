'use client'
import { usePlatformInformation } from '@/app/lib/hooks/usePlatformInformation'
import { useTranslation } from '@/lib/withT'
import { css } from '@republik/theme/css'
import type { PropsWithChildren } from 'react'
import { Frame } from '../ui/containers'
import OnboardingHeader, { OnboardingBackButton } from './onboarding-header'
import { OnboardingNextStep } from './onboarding-next-step'

export function OnboardingFollow({ children }: PropsWithChildren) {
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

        {children}
      </div>

      <OnboardingNextStep href='/'>
        {t('onboarding/follow/next')}
      </OnboardingNextStep>
    </Frame>
  )
}
