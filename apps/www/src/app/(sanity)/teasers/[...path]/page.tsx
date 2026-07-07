import { FrontTeaser } from '@/app/(sanity)/components/teaser/front/front-teaser'
import { TEASER_QUERY } from '@/app/(sanity)/groq/article-teaser-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
  },
}

export default async function ArticleTeaserPage({
  params,
}: PageProps<'/teasers/[...path]'>) {
  const { path } = await params
  const slug = `/${path.join('/')}`

  const { data: article } = await sanityFetch({
    query: TEASER_QUERY,
    params: { slug },
  })

  return <FrontTeaser {...article} />
}
