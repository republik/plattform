import { sanityFetch } from '@/app/(sanity)/lib/live'
import { css } from '@republik/theme/css'
import { defineQuery } from 'next-sanity'
import { notFound } from 'next/navigation'

// Update with your own queries
const ARTICLE_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    description,
    content,
    contributors[]{
      _id,
      kind,
      "name": contributor->title,
    }
  }`,
)

// Metadata: stega disabled to keep invisible characters out of <title>
export async function generateMetadata({
  params,
}: PageProps<'/articles/[...path]'>) {
  const { path } = await params
  const slug = path.join('/')

  const { data } = await sanityFetch({
    query: ARTICLE_QUERY,
    params: { slug },
    stega: false,
  })
  return { title: data?.title ?? 'Article not found' }
}

// Page component: default settings (stega active in Draft Mode)
export default async function PostPage({
  params,
}: PageProps<'/articles/[...path]'>) {
  const { path } = await params
  const slug = `/${path.join('/')}`

  const { data: article } = await sanityFetch({
    query: ARTICLE_QUERY,
    params: { slug },
  })

  if (!article) notFound()

  return (
    <article>
      <h1 className={css({ textStyle: 'h1Sans' })}>{article.title}</h1>
      <p>{article.description}</p>
      <ul>
        {article.contributors?.map((contributor) => (
          <li key={contributor._id}>
            {contributor.name} ({contributor.kind})
          </li>
        ))}
      </ul>
      {/* ... */}
    </article>
  )
}
