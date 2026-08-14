import ArticleDocument from '@/app/(sanity)/[...path]/components/article-document'
import PageDocument from '@/app/(sanity)/[...path]/components/page-document'
import { DOCUMENT_BY_ID_QUERY } from '@/app/(sanity)/groq/document-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { notFound } from 'next/navigation'

export default async function DocumentPreviewPage({
  params,
}: PageProps<'/preview/[id]'>) {
  const { id } = await params

  const { data } = await sanityFetch({
    query: DOCUMENT_BY_ID_QUERY,
    params: { id },
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
