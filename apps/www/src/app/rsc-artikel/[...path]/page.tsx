import { ArticleDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import { MdastRender } from './mdast-render'
// import { renderMdast } from '@app/lib/mdast/render'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params: { path },
}): Promise<Metadata> {
  const client = await getClient()
  const { data } = await client.query({
    query: ArticleDocument,
    variables: { path: `/${path.join('/')}` },
  })

  return {
    title: data?.article?.meta.title,
  }
}

export default async function ArticlePage({
  params: { path },
}: {
  params: { path: string[] }
}) {
  const client = await getClient()
  const { data } = await client.query({
    query: ArticleDocument,
    variables: { path: `/${path.join('/')}` },
  })

  if (!data.article) {
    return notFound()
  }

  const {
    article: { meta, content },
  } = data

  return (
    <div>
      <Link href={`/${path.join('/')}`}>Back to legacy article view</Link>
      <h1>{meta.title}</h1>

      <MdastRender mdast={content} />

      {/* <pre>{JSON.stringify(content, null, 2)}</pre> */}
    </div>
  )
}
