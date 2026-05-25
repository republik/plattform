import { Byline } from '@/app/(sanity)/components/byline'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { css } from '@republik/theme/css'
import { defineQuery } from 'next-sanity'
import { notFound } from 'next/navigation' // Update with your own queries

// Update with your own queries
const ARTICLE_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    description,
    content,
    "collection": articleCollection->title,
    theme->{
      kind,
      color
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
    <>
      <style>{`:root { --page-theme-accent-color: ${article.theme?.color?.hex}; }`}</style>
      <article>
        <div
          className={css({
            mx: 'auto',
            px: '15px',
            maxWidth: 'editorial',
            width: 'full',
            '& a': { textDecoration: 'underline' },
          })}
        >
          {article.collection && (
            <p
              className={css({
                textStyle: 'editorialCollection',
                mb: '-6',
                mt: '8',
              })}
              style={{ color: 'var(--page-theme-accent-color)' }}
            >
              {article.collection}
            </p>
          )}
          <h1 className={css({ textStyle: 'editorialTitle', mt: '12' })}>
            {article.title}
          </h1>
          <h3 className={css({ textStyle: 'editorialLead', mt: '4' })}>
            {article.description}
          </h3>
          <p className={css({ textStyle: 'editorialByline', mt: '4' })}>
            <Byline articleSlug={slug} />
          </p>
        </div>
        <div className={css({ height: '1000px' })}></div>
        {/* ... */}
      </article>
    </>
  )
}
