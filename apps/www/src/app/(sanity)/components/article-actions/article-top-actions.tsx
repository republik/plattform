'use client'

import { usePaynotes } from '@/app/(sanity)/components/paynotes/paynotes-context'
import type { ArticleDocumentType } from '@/app/(sanity)/groq/document-query'
import { FontSizeStepper } from '@/app/components/ui/font-size-stepper'
import { Menu, menuItemStyle } from '@/app/components/ui/responsive-menu'
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver'
import { css, cx } from '@republik/theme/css'
import { AArrowUp, EllipsisVertical } from 'lucide-react'
import { useRef } from 'react'
import { ACTION_ICON_SIZE } from './action-style'
import { audioItemFromArticle } from './audio-item'
import { AddToPlaylistAction } from './add-to-playlist-action'
import { useArticleActions } from './article-actions-context'
import { BookmarkAction } from './bookmark-action'
import { DiscussionAction } from './discussion-action'
import { collectionsDocumentId } from './document-id'
import { MENU_SIDE_OFFSET, menuTriggerStyle } from './menu-style'
import { PdfDownloadAction } from './pdf-download-action'
import { PlayAction } from './play-action'
import { ShareAction } from './share-action'

export type ArticleTopActionsProps = {
  article: ArticleDocumentType
}

export function ArticleTopActions({ article }: ArticleTopActionsProps) {
  const documentId = collectionsDocumentId(article)
  const path = article.slug
  const title = article.plainTitle
  const audioItem = audioItemFromArticle({
    _id: article._id,
    title,
    slug: path,
    publishDate: article.publishDate,
    audioSourceMp3: article.audioSourceMp3,
    audioDurationMs: article.audioDurationMs,
    syntheticVoiceEnabled: article.syntheticVoiceEnabled,
    image: article.teaserSmall?.image,
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
      className={cx(
        'article-top-actions',
        css({
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '5',
          '@media print': { display: 'none' },
        }),
      )}
    >
      <PlayAction audioItem={audioItem} />
      <BookmarkAction documentId={documentId} />
      <ShareAction title={title} path={path} />
      <DiscussionAction
        path={path}
        backendDiscussionId={article.discussion?.backendDiscussionId}
        inlineDiscussion={article.inlineDiscussion ?? false}
      />

      <Menu.Root modal={false}>
        <Menu.Trigger
          aria-label='Weitere Aktionen'
          className={menuTriggerStyle}
        >
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
              audioItem={audioItem}
              className={menuItemStyle}
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
