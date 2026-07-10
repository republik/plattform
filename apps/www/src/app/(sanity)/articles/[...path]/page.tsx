import { EditLink } from '@/app/(sanity)/components/edit-link'
import { ArticleRecommendations } from '@/app/(sanity)/components/next-reads/article-recommendations'
import { EditorialImage } from '@/app/(sanity)/components/portable-text/editorial-image'
import { hasContent } from '@/app/(sanity)/components/portable-text/helpers/hasContent'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { ArticlePortableText } from '@/app/(sanity)/components/portable-text/renderArticle'
import { Theme } from '@/app/(sanity)/components/theme'
import { ARTICLE_QUERY } from '@/app/(sanity)/groq/article-query'
import { SEO_QUERY } from '@/app/(sanity)/groq/seo-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { editorialContent } from '@republik/theme/recipes'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import FollowArticle from '../../components/follow/follow-article'

// Metadata: stega disabled to keep invisible characters out of <title>
export async function generateMetadata({
  params,
}: PageProps<'/articles/[...path]'>): Promise<Metadata> {
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

  const images = data.image?.asset
    ? {
        url: urlFor(data.image?.asset).width(1200).height(630).url(),
        width: 1200,
        height: 630,
      }
    : null

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

// Page component: default settings (stega active in Draft Mode)
export default async function ArticlePage({
  params,
}: PageProps<'/articles/[...path]'>) {
  const { path } = await params
  const slug = `/${path.join('/')}`

  const { data: article } = await sanityFetch({
    query: ARTICLE_QUERY,
    params: { slug },
  })

  if (!article) notFound()

  const { theme, cover, heading, title, description, byline } = article

  return (
    <EventTrackingContext category='Article'>
      <Theme theme={theme} />
      <article className={editorialContent({ theme: theme.name })}>
        {/* TITLE BLOCK */}
        {cover && <EditorialImage value={cover} />}
        {heading && (
          <p
            className={css({
              mb: '-6',
              mt: '8',
            })}
            style={{ color: 'var(--page-theme-accent-color)' }}
          >
            <Link href={heading.slug}>
              <InlinePortableText value={heading.title} />
            </Link>
          </p>
        )}
        <h1
          className={css({
            mt: '12',
          })}
        >
          <InlinePortableText value={title} />
        </h1>
        {hasContent(description) && (
          <h3 className={css({ mt: '4' })}>
            <InlinePortableText value={description} />
          </h3>
        )}
        <p
          className={css({
            textStyle: 'editorialByline',
            mt: '4',
            '& a': { textDecoration: 'underline' },
          })}
        >
          <InlinePortableText value={byline} />
        </p>

        <div className={css({ mt: '4' })}>
          <EditLink _id={article._id} documentType='article' />
        </div>

        <ArticlePortableText value={article.content} />

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
