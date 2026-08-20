'use client'

import { ACTION_ICON_SIZE } from './action-style'
import { AddToPlaylistAction, useAddToPlaylistAllowed } from './add-to-playlist-action'
import { BookmarkAction } from './bookmark-action'
import { collectionsDocumentId } from './document-id'
import {
  MENU_SIDE_OFFSET,
  menuItemStyle,
  menuPanelStyle,
  menuTriggerStyle,
} from './menu-style'
import { ShareAction } from './share-action'
import type { ArticleDocumentType } from '@/app/(sanity)/groq/document-query'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { css } from '@republik/theme/css'
import { EllipsisVertical } from 'lucide-react'
import { DiscussionAction } from './discussion-action'

export type ArticleBottomActionsProps = {
  article: ArticleDocumentType
}

export function ArticleBottomActions({ article }: ArticleBottomActionsProps) {
  const documentId = collectionsDocumentId(article)
  const path = article.slug
  const title = article.plainTitle

  const showAddToPlaylist = useAddToPlaylistAllowed(
    article.audioSourceMp3 ?? undefined,
  )

  return (
    <div
      className={css({
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5',
      })}
    >
      <BookmarkAction documentId={documentId} />
      <ShareAction title={title} path={path} />
      <DiscussionAction
        path={path}
        backendDiscussionId={article.discussion?.backendDiscussionId}
        inlineDiscussion={article.inlineDiscussion ?? false}
        longLabel
      />

      {showAddToPlaylist && (
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
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  )
}
