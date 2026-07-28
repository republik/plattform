import { TeaserLarge } from '@/app/(sanity)/components/teaser/large'
import { TEASER_LARGE_QUERY } from '@/app/(sanity)/groq/article-teaser-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  robots: {
    index: false,
  },
}

export default async function ArticleTeaserPage({
  params,
}: PageProps<'/preview/teasers-large/[id]'>) {
  const { id } = await params

  const { data: teaser } = await sanityFetch({
    query: TEASER_LARGE_QUERY,
    params: { id },
  })

  if (!teaser) notFound()

  return <TeaserLarge {...teaser} />
}
