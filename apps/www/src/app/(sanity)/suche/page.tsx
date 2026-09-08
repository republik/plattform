import { PageBlock } from '@/app/(sanity)/[...path]/components/page-block'
import { DOCUMENT_BY_SLUG_QUERY } from '@/app/(sanity)/groq/document-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'

import { getMe } from '@/app/lib/auth/me'
import { CDN_FRONTEND_BASE_URL } from '@/lib/constants'
import { css } from '@republik/theme/css'
import { Metadata } from 'next'
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

  const { data } = await sanityFetch({
    query: DOCUMENT_BY_SLUG_QUERY,
    params: { slug: '/suche' },
  })

  const page = data?._type === 'page' ? data : undefined

  return (
    <SearchClient>
      <div
        className={css({
          mt: '12',
          '& h3': { textAlign: 'left' },
          '& ul': { justifyContent: 'left' },
        })}
      >
        {page?.pageBuilder?.map((block) => (
          <PageBlock key={block._key} block={block} documentId={page._id} />
        ))}
      </div>
    </SearchClient>
  )
}
