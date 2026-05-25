import { Byline } from '@/app/(sanity)/components/byline'
import { EditLink } from '@/app/(sanity)/components/edit-link'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { ArticleRecommendations } from '@/app/components/next-reads/article-recommendations'
import { ArticleSection } from '@/app/components/ui/section'
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
      color
    },
    contributors[]{
      _id,
      kind,
      "slug": contributor->userId,
      "name": contributor->title,
    },
    articleRecommendations[]->{
      _id,
      title,
      description,
      slug,
      "collection": articleCollection->title,
      theme->{
        color
      },
      contributors[]{
        kind,
        "name": contributor->title,
      }
    }
  }`,
)

// Metadata: stega disabled to keep invisible characters out of <title>
export async function generateMetadata({
  params,
}: PageProps<'/articles/[...path]'>) {
  const { path } = await params
  const slug = `/${path.join('/')}`

  const { data } = await sanityFetch({
    query: ARTICLE_QUERY,
    params: { slug },
    stega: false,
  })
  const collectionPrefix = data.collection ? `${data.collection}: ` : ''
  const siteSuffix = ' - Republik'
  return {
    title: data
      ? `${collectionPrefix}
          ${data.title}
          ${siteSuffix}`
      : 'Article not found',
  }
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

  console.log({ article })

  return (
    <>
      <style>{`:root { --page-theme-accent-color: ${article.theme?.color?.hex}; }`}</style>
      <article>
        {/* TITLE BLOCK */}
        <ArticleSection>
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
          <p
            className={css({
              textStyle: 'editorialByline',
              mt: '4',
              '& a': { textDecoration: 'underline' },
            })}
          >
            <Byline contributors={article.contributors} />
          </p>

          <div className={css({ mt: '4' })}>
            <EditLink _id={article._id} />
          </div>
        </ArticleSection>

        <div className={css({ height: '300px' })}></div>

        <ArticleRecommendations
          recommendations={article.articleRecommendations}
        />
      </article>
    </>
  )
}
