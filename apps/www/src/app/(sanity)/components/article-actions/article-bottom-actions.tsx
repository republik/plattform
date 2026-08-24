'use client'

import { ACTION_ICON_SIZE } from './action-style'
import { AddToPlaylistAction, useAddToPlaylistAllowed } from './add-to-playlist-action'
import { BookmarkAction } from './bookmark-action'
import { collectionsDocumentId } from './document-id'
import { MENU_SIDE_OFFSET, menuTriggerStyle } from './menu-style'
import { ShareAction } from './share-action'
import type { ArticleDocumentType } from '@/app/(sanity)/groq/document-query'
import { Menu, menuItemStyle } from '@/app/components/ui/responsive-menu'
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
        '@media print': { display: 'none' },
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
            <Menu.Item asChild>
              <AddToPlaylistAction
                documentId={documentId}
                durationMs={article.audioDurationMs ?? undefined}
                mp3={article.audioSourceMp3 ?? undefined}
                path={path}
                title={title}
                className={menuItemStyle}
              />
            </Menu.Item>
          </Menu.Content>
        </Menu.Root>
      )}
    </div>
  )
}
