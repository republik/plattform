import { EditLink } from '@/app/(sanity)/components/edit-link'
import { ArticleRecommendations } from '@/app/(sanity)/components/next-reads/article-recommendations'
import { EditorialImage } from '@/app/(sanity)/components/portable-text/editorial-image'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { Theme } from '@/app/(sanity)/components/theme'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { editorialContent } from '@republik/theme/recipes'
import { Metadata } from 'next'
import { defineQuery } from 'next-sanity'
import { notFound } from 'next/navigation'
import FollowArticle from '../../components/follow/follow-article'
import { ArticleContent } from './components/article-content'
import { urlFor } from '@/app/(sanity)/lib/urlFor'

const ARTICLE_SEO_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $slug][0]{
    "title": coalesce(seo.title, pt::text(title)),
    "description": coalesce(seo.description, pt::text(description)),
    "image": coalesce(seo.image, image)
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

const ARTICLE_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    description,
    byline,
    cover {
      ...
    },
    heading->{
      _id,
      "title": pt::text(title),
    },
    newsletter->{
      title,
      description,
      frequency,
      image,
      name,
    },
    theme {
      darkMode,
      accentColor
    },
    contributors[]{
      _id,
      kind,
      "slug": contributor->userId,
      "name": contributor->title,
      "description": contributor->description,
      "portrait": contributor->portrait
    },
    "articleCollection": articleCollections[0]->{
      _id,
      title,
      description,
      image
    },
    articleRecommendations[]->{
      _id,
      title,
      description,
      slug,
      heading->{
        _id,
        "title": pt::text(title),
      },
      theme {
        accentColor
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
      <Theme theme={article.theme} />
      <article className={editorialContent()}>
        {/* TITLE BLOCK */}
        {article.cover && <EditorialImage value={article.cover} />}
        {article.heading && (
          <p
            className={css({
              textStyle: 'editorialCollection',
              mb: '-6',
              mt: '8',
            })}
            style={{ color: 'var(--page-theme-accent-color)' }}
          >
            {article.heading.title}
          </p>
        )}
        <h1
          className={css({
            textStyle: 'editorialTitle',
            mt: '12',
          })}
        >
          <InlinePortableText value={article.title} />
        </h1>
        <h3 className={css({ textStyle: 'editorialLead', mt: '4' })}>
          <InlinePortableText value={article.description} />
        </h3>
        <p
          className={css({
            textStyle: 'editorialByline',
            mt: '4',
            '& a': { textDecoration: 'underline' },
          })}
        >
          <InlinePortableText value={article.byline} />
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
