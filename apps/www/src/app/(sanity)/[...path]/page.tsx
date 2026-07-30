import ArticleDocument from '@/app/(sanity)/[...path]/components/article-document'
import PageDocument from '@/app/(sanity)/[...path]/components/page-document'
import { DOCUMENT_QUERY } from '@/app/(sanity)/groq/document-query'
import { SEO_QUERY } from '@/app/(sanity)/groq/seo-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Metadata: stega disabled to keep invisible characters out of <title>
export async function generateMetadata({
  params,
}: PageProps<'/[...path]'>): Promise<Metadata> {
  const { path } = await params
  const slug = `/${path.join('/')}`

  const { data } = await sanityFetch({
    query: SEO_QUERY,
    params: { slug },
    stega: false,
  })

  if (!data) {
    return { title: 'Artikel nicht gefunden' }
  }

  let images = null

  try {
    if (data.useImageBuilder) {
      // Rendered "Share Image" (old style) generated on the fly by /api/og.
      images = {
        url: new URL(
          `/api/og?slug=${encodeURIComponent(slug)}`,
          process.env.NEXT_PUBLIC_BASE_URL,
        ).toString(),
        width: 1200,
        height: 630,
      }
    } else if (data.image) {
      // Static social image: point directly at the Sanity CDN crop.
      images = {
        url: urlFor(data.image).width(1200).height(630).url(),
        width: 1200,
        height: 630,
      }
    }
  } catch (error) {
    console.error('Error generating image URL:', error)
  }

  return {
    title: data.title,
    description: data.description,
    openGraph: {
      title: data.title,
      description: data?.description,
      url: new URL(slug, process.env.NEXT_PUBLIC_BASE_URL),
      images,
    },
  }
}

export default async function DocumentPage({
  params,
}: PageProps<'/[...path]'>) {
  const { path } = await params
  const slug = `/${path.join('/')}`

  const { data } = await sanityFetch({
    query: DOCUMENT_QUERY,
    params: { slug },
  })

  if (!data) {
    notFound()
  }

  return data._type === 'article' ? (
    <ArticleDocument article={data} />
  ) : data._type === 'page' ? (
    <PageDocument page={data} />
  ) : null
}
