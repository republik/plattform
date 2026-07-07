import { FrontTeaser } from '@/app/(sanity)/components/teaser/front/front-teaser'
import { ARTICLE_QUERY } from '@/app/(sanity)/groq/article-query'
import { ARTICLE_TEASER_QUERY } from '@/app/(sanity)/groq/article-teaser-query'
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
    query: ARTICLE_TEASER_QUERY,
    params: { slug },
  })

  return <FrontTeaser {...article} />
}
