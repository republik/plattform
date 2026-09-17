import ArticleDocument from '@/app/(sanity)/[...path]/components/article-document'
import PageDocument from '@/app/(sanity)/[...path]/components/page-document'
import { DOCUMENT_BY_SLUG_QUERY } from '@/app/(sanity)/groq/document-query'
import { SEO_QUERY } from '@/app/(sanity)/groq/seo-query'
import { sanityClientFetch } from '@/app/(sanity)/lib/fetch'
import { getArticleJsonLd } from '@/app/(sanity)/lib/json-ld'
import { getSocialImage } from '@/app/(sanity)/lib/social-image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Metadata: stega disabled to keep invisible characters out of <title>
export async function generateMetadata({
  params,
}: PageProps<'/[...path]'>): Promise<Metadata> {
  const { path } = await params
  const slug = `/${path.join('/')}`

  const data = await sanityClientFetch(
    SEO_QUERY,
    { slug },
    { tag: 'metadata-article-page', stega: false },
  )

  if (!data) {
    return { title: 'Artikel nicht gefunden' }
  }

  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data?.description,
      url: new URL(slug, process.env.NEXT_PUBLIC_BASE_URL),
      images: getSocialImage(data, slug),
    },
  }
}

export default async function DocumentPage({
  params,
}: PageProps<'/[...path]'>) {
  const { path } = await params
  const slug = `/${path.join('/')}`

  const data = await sanityClientFetch(DOCUMENT_BY_SLUG_QUERY, { slug })

  if (!data) {
    notFound()
  }

  return data._type === 'article' ? (
    <>
      <script type='application/ld+json'>
        {JSON.stringify(getArticleJsonLd(data))}
      </script>
      <ArticleDocument article={data} />
    </>
  ) : data._type === 'page' ? (
    <PageDocument page={data} />
  ) : null
}
