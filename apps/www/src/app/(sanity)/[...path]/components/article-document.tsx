import { ContentWall } from '@/app/(sanity)/[...path]/components/content-wall'
import { EditLink } from '@/app/(sanity)/components/edit-link'
import FollowArticle from '@/app/(sanity)/components/follow/follow-article'
import { ArticleRecommendations } from '@/app/(sanity)/components/next-reads/article-recommendations'
import { EditorialImage } from '@/app/(sanity)/components/portable-text/editorial-image'
import { hasContent } from '@/app/(sanity)/components/portable-text/helpers/hasContent'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { ArticlePortableText } from '@/app/(sanity)/components/portable-text/renderArticle'
import { SeriesMenu } from '@/app/(sanity)/components/series-menu'
import { Theme } from '@/app/(sanity)/components/theme'
import type { ArticleDocumentType } from '@/app/(sanity)/groq/document-query'
import type { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { editorialContent } from '@republik/theme/recipes'
import Link from 'next/link'

export default async function ArticleDocument({
  article,
}: {
  article: ArticleDocumentType
}) {
  const {
    slug,
    theme,
    cover,
    heading,
    title,
    description,
    byline,
    articleCollection,
    readingAccess,
  } = article
  const seriesId = articleCollection?.series && articleCollection?._id

  return (
    <EventTrackingContext category='Article'>
      <Theme theme={theme} />
      {seriesId && <SeriesMenu slug={slug} />}
      <article
        // Puts the whole app in dark mode (see the `dark` condition in preset-republik.ts).
        data-force-theme={theme?.darkMode ? 'dark' : undefined}
        className={editorialContent({
          theme: theme?.name,
        })}
      >
        {/* TITLE BLOCK */}
        {cover && <EditorialImage value={cover} />}

        {heading && (
          <p className='page-heading'>
            <Link href={heading.slug}>
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
          <EditLink documentId={article._id} documentType='article' />
        </div>

        <ContentWall readingAccess={readingAccess}>
          <ArticlePortableText value={article.content} />
        </ContentWall>

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
