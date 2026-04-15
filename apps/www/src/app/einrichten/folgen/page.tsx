// second "onbarding tip"

import FollowOnboarding from '@app/components/onboarding/follow'
import { getMe } from '@app/lib/auth/me'
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

  return <FollowOnboarding />
}
