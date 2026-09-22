import { ContentWall } from '@/app/(sanity)/[...path]/components/content-wall'
import { ArticleActionsProvider } from '@/app/(sanity)/components/article-actions/article-actions-context'
import { ArticleBottomActions } from '@/app/(sanity)/components/article-actions/article-bottom-actions'
import { ArticleFloatingActions } from '@/app/(sanity)/components/article-actions/article-floating-actions'
import { ArticleTopActions } from '@/app/(sanity)/components/article-actions/article-top-actions'
import { JumpToReadingPosition } from '@/app/(sanity)/components/article-actions/continue-reading-action'
import { CoverAudioButton } from '@/app/(sanity)/components/article-actions/cover-audio-button'
import { collectionsDocumentId } from '@/app/(sanity)/components/article-actions/document-id'
import { ReadingPositionTracker } from '@/app/(sanity)/components/article-actions/reading-position-tracker'
import { EditLink } from '@/app/(sanity)/components/edit-link'
import FollowArticle from '@/app/(sanity)/components/follow/follow-article'
import { AutomaticRecommendations } from '@/app/(sanity)/components/next-reads/automatic-recommendations'
import { EditorsRecommendations } from '@/app/(sanity)/components/next-reads/editors-recommendations'
import { GiftPaynote } from '@/app/(sanity)/components/paynotes/gift-paynote'
import PaynoteInline from '@/app/(sanity)/components/paynotes/paynote/paynote-inline'
import { WelcomeBanner } from '@/app/(sanity)/components/paynotes/paynotes-in-trial/welcome'
import { EditorialImage } from '@/app/(sanity)/components/portable-text/editorial-image'
import { hasContent } from '@/app/(sanity)/components/portable-text/helpers/hasContent'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import { ArticlePortableText } from '@/app/(sanity)/components/portable-text/renderArticle'
import { ProlitterisTracking } from '@/app/(sanity)/components/prolitteris-tracking'
import { SeriesMenu } from '@/app/(sanity)/components/series-menu'
import { TeaserSmallPreviewLink } from '@/app/(sanity)/components/teaser-small-preview-link'
import { Theme } from '@/app/(sanity)/components/theme'
import type { ArticleDocumentType } from '@/app/(sanity)/groq/document-query'
import type { TeaserSmallFragmentType } from '@/app/(sanity)/groq/teaser-small-fragment'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'
import { css } from '@republik/theme/css'
import { editorialContent } from '@republik/theme/recipes'
import { toPlainText } from 'next-sanity'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { Suspense } from 'react'

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
    repoId,
    podcast,
  } = article
  const seriesId = articleCollection?.series && articleCollection?._id
  const documentId = collectionsDocumentId(article)

  const isDraftMode = (await draftMode()).isEnabled

  return (
    <EventTrackingContext category='Article'>
      <Theme theme={theme} />
      {seriesId && <SeriesMenu slug={slug} />}
      <WelcomeBanner />
      {!isDraftMode && (
        <ProlitterisTracking
          sanityId={article._id}
          repoId={repoId}
          path={slug}
        />
      )}
      <ArticleActionsProvider>
        <article
          // Puts the whole app in dark mode (see the `dark` condition in preset-republik.ts).
          data-force-theme={theme?.darkMode ? 'dark' : undefined}
          className={editorialContent({
            theme: theme?.name,
          })}
        >
          {cover && (
            <EditorialImage value={cover}>
              {podcast?._id && (
                <CoverAudioButton
                  targetId={article._id}
                  durationMs={article.audioDurationMs ?? undefined}
                  mp3={article.audioSourceMp3 ?? undefined}
                  path={slug}
                  title={toPlainText(title)}
                  publishDate={article.publishDate}
                />
              )}
            </EditorialImage>
          )}

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

          <div className={css({ display: 'flex', gap: '2' })}>
            <EditLink documentId={article._id} documentType='article' />
            <TeaserSmallPreviewLink documentId={article._id} />
          </div>

          <ContentWall
            readingAccess={readingAccess}
            documentId={documentId}
            excerpt={
              <ArticlePortableText value={article.content?.slice(0, 3)} />
            }
            fullContent={<ArticlePortableText value={article.content} />}
          />

          {/* End of the text: everything below is outside the measured region. */}
          <ReadingPositionTracker documentId={documentId} />

          <ArticleBottomActions article={article} />

          <PaynoteInline />
          <GiftPaynote />

          <FollowArticle
            seriesId={seriesId}
            contributors={article.contributors}
            collection={article.articleCollection}
            newsletter={article.newsletter}
          />

          <EditorsRecommendations
            recommendations={
              article.articleRecommendations as TeaserSmallFragmentType[]
            }
          />
        </article>

        <Suspense>
          <AutomaticRecommendations currentDocumentId={article._id} />
        </Suspense>

        <ArticleFloatingActions article={article} />
      </ArticleActionsProvider>
    </EventTrackingContext>
  )
}
