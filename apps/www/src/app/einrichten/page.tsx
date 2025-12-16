// as the first "onboarding tip," this page takes the place of the old /einrichten page

import NewslettersOnboarding from '@app/components/onboarding/newsletters'
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

  return <NewslettersOnboarding />
}
