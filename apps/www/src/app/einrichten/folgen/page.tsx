// second "onbarding tip"

import { AuthorsSection } from '@/app/components/onboarding/authors-section'
import { OnboardingFollow } from '@/app/components/onboarding/follow'
import { FormatsSection } from '@/app/components/onboarding/formats-section'
import { PodcastsSection } from '@/app/components/onboarding/podcasts-section'
import { getMe } from '@/app/lib/auth/me'
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
    <OnboardingFollow>
      <FormatsSection />
      <AuthorsSection />
      <PodcastsSection />
    </OnboardingFollow>
  )
}
