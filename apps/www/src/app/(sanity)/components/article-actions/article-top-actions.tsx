'use client'

import { usePaynotes } from '@/app/(sanity)/components/paynotes/paynotes-context'
import { ACTION_ICON_SIZE } from './action-style'
import { AddToPlaylistAction } from './add-to-playlist-action'
import { useArticleActions } from './article-actions-context'
import { BookmarkAction } from './bookmark-action'
import { collectionsDocumentId } from './document-id'
import { MENU_SIDE_OFFSET, menuTriggerStyle } from './menu-style'
import { PdfDownloadAction } from './pdf-download-action'
import { PlayAction } from './play-action'
import { ShareAction } from './share-action'
import type { ArticleDocumentType } from '@/app/(sanity)/groq/document-query'
import { FontSizeStepper } from '@/app/components/ui/font-size-stepper'
import { Menu, menuItemStyle } from '@/app/components/ui/responsive-menu'
import { getAudioCoverImages } from '@/components/Audio/helpers/audioCoverImages'
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver'
import { AArrowUp, EllipsisVertical } from 'lucide-react'
import { css } from '@republik/theme/css'
import { DiscussionAction } from './discussion-action'
import { useRef } from 'react'

export type ArticleTopActionsProps = {
  article: ArticleDocumentType
}

export function ArticleTopActions({ article }: ArticleTopActionsProps) {
  const documentId = collectionsDocumentId(article)
  const path = article.slug
  const title = article.plainTitle
  const coverImages = getAudioCoverImages({
    teaserSmallImage: article.teaserSmall?.image,
    cover: article.cover,
    collectionImage: article.articleCollection?.image,
  })

  // Not signed in, or trial ended: reader is looking at a paywall, so the
  // full text isn't theirs to download.
  const { hasPaywall } = usePaynotes()

  // The floating action bar stays hidden while this row is on screen.
  const ref = useRef<HTMLDivElement>(null)
  const { setTopActionsEntry } = useArticleActions()
  useIntersectionObserver(ref, {
    callback: (_isIntersecting, entry) => setTopActionsEntry(entry),
  })

  return (
    <div
      ref={ref}
      className={css({
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5',
        '@media print': { display: 'none' },
      })}
    >
      <PlayAction
        documentId={documentId}
        durationMs={article.audioDurationMs ?? undefined}
        mp3={article.audioSourceMp3 ?? undefined}
        path={path}
        title={title}
        {...coverImages}
      />
      <BookmarkAction documentId={documentId} />
      <ShareAction title={title} path={path} />
      <DiscussionAction
        path={path}
        backendDiscussionId={article.discussion?.backendDiscussionId}
        inlineDiscussion={article.inlineDiscussion ?? false}
      />

      <Menu.Root modal={false}>
        <Menu.Trigger aria-label='Weitere Aktionen' className={menuTriggerStyle}>
          <EllipsisVertical size={ACTION_ICON_SIZE} />
        </Menu.Trigger>
        <Menu.Content
          align='end'
          sideOffset={MENU_SIDE_OFFSET}
          collisionPadding={16}
          title='Weitere Aktionen'
        >
          {!hasPaywall && (
            <Menu.Item asChild>
              <PdfDownloadAction
                path={path}
                version={article._updatedAt}
                className={menuItemStyle}
              />
            </Menu.Item>
          )}
          <Menu.Item asChild>
            <AddToPlaylistAction
              documentId={documentId}
              durationMs={article.audioDurationMs ?? undefined}
              mp3={article.audioSourceMp3 ?? undefined}
              path={path}
              title={title}
              className={menuItemStyle}
              {...coverImages}
            />
          </Menu.Item>
          <Menu.Item className={menuItemStyle} closeOnSelect={false}>
            <AArrowUp size={ACTION_ICON_SIZE} />
            Schriftgrösse
            <FontSizeStepper />
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>
    </div>
  )
}
