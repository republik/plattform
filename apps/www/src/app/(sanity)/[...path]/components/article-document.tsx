import { ActionBar } from '@/app/(sanity)/components/action-bar/actionbar'
import {
  audioQueueDocumentId,
  collectionsDocumentId,
} from '@/app/(sanity)/components/action-bar/document-id'
import { getArticlePdfUrl } from '@/app/(sanity)/components/action-bar/pdf-url'
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
import { getMe } from '@/app/lib/auth/me'
import { PUBLIC_BASE_URL } from '@/lib/constants'
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
  } = article
  const seriesId = articleCollection?.series && articleCollection?._id

  // Derived here rather than in the client action bar: all of it is a pure
  // function of the document, and membership lets non-members skip the button
  // entirely instead of being hidden by CSS after hydration.
  const { isMember, hasActiveMembership } = await getMe()
  const documentId = collectionsDocumentId({ _id: article._id })
  const audioDocumentId = audioQueueDocumentId({ repoId: article.repoId })
  const shareUrl = new URL(slug, PUBLIC_BASE_URL).toString()
  const pdfHref = getArticlePdfUrl({
    path: slug,
    version: article._updatedAt,
  })

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

        <ActionBar
          audio={{
            mp3: article.audioSourceMp3 ?? undefined,
            durationMs: article.audioDurationMs ?? undefined,
          }}
          audioDocumentId={audioDocumentId}
          documentId={documentId}
          // `getMe` derives isMember from an optional chain, so coerce: signed
          // out it is undefined, not false.
          initialCanBookmark={!!isMember && hasActiveMembership}
          initialIsMember={!!isMember}
          path={slug}
          pdfHref={pdfHref}
          sanityId={article._id}
          shareUrl={shareUrl}
          title={article.plainTitle}
        />

        <div>
          <EditLink documentId={article._id} documentType='article' />
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
