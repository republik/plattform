import { EditLink } from '@/app/(sanity)/components/edit-link'
import { ArticleRecommendations } from '@/app/(sanity)/components/next-reads/article-recommendations'
import { EditorialImage } from '@/app/(sanity)/components/portable-text/editorial-image'
import { hasContent } from '@/app/(sanity)/components/portable-text/helpers/hasContent'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { ArticlePortableText } from '@/app/(sanity)/components/portable-text/renderArticle'
import { SeriesMenu } from '@/app/(sanity)/components/series-menu'
import { Theme } from '@/app/(sanity)/components/theme'
import { ARTICLE_QUERY } from '@/app/(sanity)/groq/article-query'
import { SEO_QUERY } from '@/app/(sanity)/groq/seo-query'
import type { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { urlFor } from '@/app/(sanity)/lib/urlFor'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
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

  const {
    theme,
    cover,
    heading,
    title,
    description,
    byline,
    articleCollection,
  } = article
  const seriesId = articleCollection?.series && articleCollection?._id

  return (
    <EventTrackingContext category='Article'>
      <Theme theme={theme} />
      {seriesId && <SeriesMenu slug={slug} />}
      <article
        className={editorialContent({
          theme: theme?.name,
        })}
      >
        {/* TITLE BLOCK */}
        {cover && <EditorialImage value={cover} />}

        {heading && (
          <p className='page-heading'>
            <Link href={`/pages${heading.slug}`}>
              <InlinePortableText value={heading.title} />
            </Link>
          </p>
        )}
        <h1 className='page-title'>
          <InlinePortableText value={title} />
        </h1>
        {hasContent(description) && (
          <p className='page-lead'>
            <InlinePortableText value={description} />
          </p>
        )}
        <p className='page-byline'>
          <InlinePortableText value={byline} />
        </p>

        <div>
          <EditLink _id={article._id} documentType='article' />
        </div>

        <ArticlePortableText value={article.content} />

        <FollowArticle
          seriesId={seriesId}
          contributors={article.contributors}
          collection={article.articleCollection}
          newsletter={article.newsletter}
        />

        <ArticleRecommendations
          recommendations={
            article.articleRecommendations as TeaserSmallFragmentType[]
          }
        />
      </article>
    </EventTrackingContext>
  )
}
