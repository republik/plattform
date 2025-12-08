'use client'

import { css, cx } from '@republik/theme/css'
import { button } from '@republik/theme/recipes'
import Link from 'next/link'
import OnboardingHeader from './onboarding-header'

function OnboardingWelcome() {
  return (
    <OnboardingHeader>
      <h1>Willkommen!</h1>
      <p>
        We still have <b>zwei Tipps für Sie</b>, to help you get the most out of
        your subscription.
      </p>
      <div className={css({ mt: 4, md: { maxWidth: '330px', mx: 'auto' } })}>
        <Link
          className={cx(button({ size: 'full' }), css({ mt: 2 }))}
          href='/einrichten'
        >
          {"Los geht's!"}
        </Link>
      </div>
    </OnboardingHeader>
  )
}

export default OnboardingWelcome
