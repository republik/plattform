import { ArticleActionsProvider } from '@/app/(sanity)/components/article-actions/article-actions-context'
import { ArticleBottomActions } from '@/app/(sanity)/components/article-actions/article-bottom-actions'
import { ArticleFloatingActions } from '@/app/(sanity)/components/article-actions/article-floating-actions'
import { ArticleTopActions } from '@/app/(sanity)/components/article-actions/article-top-actions'
import { JumpToReadingPosition } from '@/app/(sanity)/components/article-actions/continue-reading-action'
import { collectionsDocumentId } from '@/app/(sanity)/components/article-actions/document-id'
import { ReadingPositionTracker } from '@/app/(sanity)/components/article-actions/reading-position-tracker'
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

export default function ArticleDocument({
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
  const documentId = collectionsDocumentId(article)

  return (
    <EventTrackingContext category='Article'>
      <Theme theme={theme} />
      {seriesId && <SeriesMenu slug={slug} />}
      <ArticleActionsProvider>
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

          <ArticleTopActions article={article} />

        {/* Floating, viewport-anchored — but inside the <article> it measures
            against, and early in the tab order for an offer made on arrival. */}
        <JumpToReadingPosition documentId={documentId} />

        <div>
          <EditLink documentId={article._id} documentType='article' />
        </div>

          <ContentWall
            readingAccess={readingAccess}
            excerpt={
              <ArticlePortableText value={article.content?.slice(0, 5)} />
            }
            fullContent={<ArticlePortableText value={article.content} />}
          />

        {/* End of the text: everything below is outside the measured region. */}
        <ReadingPositionTracker documentId={documentId} />

        <ArticleBottomActions article={article} />

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

        {/* Rendered outside the article: the `editorialContent` grid applies a
            top margin to every direct child, fixed elements included. */}
        <ArticleFloatingActions article={article} />
      </ArticleActionsProvider>
    </EventTrackingContext>
  )
}
