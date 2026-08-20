'use client'

import { usePaynotes } from '@/app/(sanity)/components/paynotes/paynotes-context'
import { ACTION_ICON_SIZE } from './action-style'
import { AddToPlaylistAction } from './add-to-playlist-action'
import { useArticleActions } from './article-actions-context'
import { BookmarkAction } from './bookmark-action'
import { collectionsDocumentId } from './document-id'
import {
  MENU_SIDE_OFFSET,
  menuItemStyle,
  menuPanelStyle,
  menuTriggerStyle,
} from './menu-style'
import { PdfDownloadAction } from './pdf-download-action'
import { PlayAction } from './play-action'
import { ShareAction } from './share-action'
import type { ArticleDocumentType } from '@/app/(sanity)/groq/document-query'
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { AArrowUp, EllipsisVertical } from 'lucide-react'
import { FontSizeDialog } from '@/app/components/ui/font-size-dialog'
import { css } from '@republik/theme/css'
import { DiscussionAction } from './discussion-action'
import { useState } from 'react'
import { useRef } from 'react'

export type ArticleTopActionsProps = {
  article: ArticleDocumentType
}

export function ArticleTopActions({ article }: ArticleTopActionsProps) {
  const [fontSizeOpen, setFontSizeOpen] = useState(false)
  const documentId = collectionsDocumentId(article)
  const path = article.slug
  const title = article.plainTitle

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
      })}
    >
      <PlayAction
        documentId={documentId}
        durationMs={article.audioDurationMs ?? undefined}
        mp3={article.audioSourceMp3 ?? undefined}
        path={path}
        title={title}
      />
      <BookmarkAction documentId={documentId} />
      <ShareAction title={title} path={path} />
      <DiscussionAction
        path={path}
        backendDiscussionId={article.discussion?.backendDiscussionId}
        inlineDiscussion={article.inlineDiscussion ?? false}
      />

      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger
          aria-label='Weitere Aktionen'
          className={menuTriggerStyle}
        >
          <EllipsisVertical size={ACTION_ICON_SIZE} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align='end'
            sideOffset={MENU_SIDE_OFFSET}
            collisionPadding={16}
            className={menuPanelStyle}
          >
            {!hasPaywall && (
              <DropdownMenu.Item asChild>
                <PdfDownloadAction
                  path={path}
                  version={article._updatedAt}
                  className={menuItemStyle}
                />
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item asChild>
              <AddToPlaylistAction
                documentId={documentId}
                durationMs={article.audioDurationMs ?? undefined}
                mp3={article.audioSourceMp3 ?? undefined}
                path={path}
                title={title}
                className={menuItemStyle}
              />
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className={menuItemStyle}
              onSelect={() => setFontSizeOpen(true)}
            >
              <AArrowUp size={ACTION_ICON_SIZE} />
              Schriftgrösse
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {/*
        Sibling of DropdownMenu.Root, never a child: opening a Radix Dialog
        from inside a closing Dialog/DropdownMenu strands `pointer-events:
        none` on <body>.
      */}
      <FontSizeDialog open={fontSizeOpen} onOpenChange={setFontSizeOpen} />
    </div>
  )
}
