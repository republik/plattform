import ArticleDocument from '@/app/(sanity)/[...path]/components/article-document'
import PageDocument from '@/app/(sanity)/[...path]/components/page-document'
import { DOCUMENT_QUERY } from '@/app/(sanity)/groq/document-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { notFound } from 'next/navigation'

export default async function DocumentPreviewPage({
  params,
}: PageProps<'/preview/[...path]'>) {
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
