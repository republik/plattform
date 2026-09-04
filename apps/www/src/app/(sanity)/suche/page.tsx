import { Metadata } from 'next'

import { getMe } from '@/app/lib/auth/me'
import { CDN_FRONTEND_BASE_URL } from '@/lib/constants'
import { SearchClient } from './components/search-client'
import { SearchGate } from './components/search-gate'

const title = 'Suche'

export const metadata: Metadata = {
  title: { absolute: title },
  openGraph: {
    title,
    images: [`${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`],
  },
}

export default async function SearchPage() {
  const { hasActiveMembership } = await getMe()

  if (!hasActiveMembership) {
    return <SearchGate />
  }

  return <SearchClient />
}
