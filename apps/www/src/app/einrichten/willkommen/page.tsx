// welcome page for the onboarding, only shown when extra context is necessary
// (e.g.: automatic redirect after sign-in)

import { PageLayout } from '@app/components/layout'
import OnboardingWelcome from '@app/components/onboarding/welcome'
import { getMe } from '@app/lib/auth/me'
import { css } from '@republik/theme/css'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Willkommen!',
}

export default async function Page() {
  const { me } = await getMe()
  if (!me) {
    return redirect('/anmelden')
  }

  return (
    <PageLayout showFooter={false} showHeader={false}>
      <div
        className={css({
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        <div className={css({ my: 'auto' })}>
          <OnboardingWelcome />
        </div>
      </div>
    </PageLayout>
  )
}
