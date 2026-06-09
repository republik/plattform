import { ArticleTheme } from '@/app/(sanity)/articles/[...path]/components/article-theme'
import { Byline } from '@/app/(sanity)/articles/[...path]/components/byline'
import { EditLink } from '@/app/(sanity)/articles/[...path]/components/edit-link'
import FollowArticle from '@/app/(sanity)/components/follow/follow-article'
import { ArticleRecommendations } from '@/app/(sanity)/components/next-reads/article-recommendations'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { ArticleSection } from '@/app/components/ui/section'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { Metadata } from 'next'
import { defineQuery } from 'next-sanity'
import { notFound } from 'next/navigation'
import { ArticleContent } from './components/article-content'
import { editorialContent } from '@republik/theme/recipes'

const ARTICLE_SEO_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $slug][0]{
    "title": coalesce(seo.title, title),
    "description": coalesce(seo.description, description)
  }`,
)

// Metadata: stega disabled to keep invisible characters out of <title>
export async function generateMetadata({
  params,
}: PageProps<'/articles/[...path]'>): Promise<Metadata> {
  const { path } = await params
  const slug = `/${path.join('/')}`

  const { data } = await sanityFetch({
    query: ARTICLE_SEO_QUERY,
    params: { slug },
    stega: false,
  })

  return {
    title: data?.title ?? 'Artikel nicht gefunden',
    description: data?.description ?? '',
  }
}

const ARTICLE_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    description,
    seo {
      title,
      description
    },
    articleCollection->{
      title,
      description,
      image
    },
    newsletter->{
      title,
      description,
      frequency,
      image,
      name,
    },
    theme->{
      darkMode,
      color
    },
    contributors[]{
      _id,
      kind,
      "slug": contributor->userId,
      "name": contributor->title,
      "description": contributor->description,
      "portrait": contributor->portrait
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
    <EventTrackingContext category='Article'>
      <ArticleTheme theme={article.theme} />
      <article className={editorialContent()}>
        {/* TITLE BLOCK */}
        {article.articleCollection && (
          <p
            className={css({
              textStyle: 'editorialCollection',
              mb: '-6',
              mt: '8',
            })}
            style={{ color: 'var(--page-theme-accent-color)' }}
          >
            {article.articleCollection.title}
          </p>
        )}
        <h1
          className={css({
            textStyle: 'editorialTitle',
            mt: '12',
          })}
        >
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

        <ArticleContent slug={slug} />

        <FollowArticle
          contributors={article.contributors}
          collection={article.articleCollection}
          newsletter={article.newsletter}
        />

        <ArticleRecommendations
          recommendations={article.articleRecommendations}
        />
      </article>
    </EventTrackingContext>
  )
}
