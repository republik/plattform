'use client'

import { ACTION_ICON_SIZE } from '@/app/(sanity)/components/article-actions/action-style'
import {
  AddToPlaylistAction,
  useAddToPlaylistAllowed,
} from '@/app/(sanity)/components/article-actions/add-to-playlist-action'
import { BookmarkAction } from '@/app/(sanity)/components/article-actions/bookmark-action'
import { collectionsDocumentId } from '@/app/(sanity)/components/article-actions/document-id'
import { DiscussionAction } from '@/app/(sanity)/components/article-actions/discussion-action'
import {
  MENU_SIDE_OFFSET,
  menuItemStyle,
  menuPanelStyle,
  menuTriggerStyle,
} from '@/app/(sanity)/components/article-actions/menu-style'
import { PlayAction } from '@/app/(sanity)/components/article-actions/play-action'
import type { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { css } from '@republik/theme/css'
import { EllipsisVertical } from 'lucide-react'

export function TeaserActions({ teaser }: { teaser: TeaserListItemType }) {
  const mp3 =
    teaser._type === 'article' ? teaser.audioSourceMp3 ?? undefined : undefined
  const showAddToPlaylist = useAddToPlaylistAllowed(mp3)

  // Only articles carry audio/discussion data, and standalone teaser
  // documents point at other content — there's nothing of their own to
  // play, bookmark, or discuss.
  if (teaser._type !== 'article') {
    return null
  }

  const documentId = collectionsDocumentId(teaser)
  const path = teaser.slug
  const title = teaser.plainTitle ?? ''

  return (
    <div
      // Switches shared actions (see `action-style.ts`) to their compact
      // look: no pill background on play, no text label on bookmark.
      data-compact-actions
      className={css({
        // Places it above the title's `linkOverlay` `::before`, which would
        // otherwise sit on top and swallow clicks — see
        // `teaser-audio-play-button.tsx` for the same fix.
        position: 'relative',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '5',
      })}
    >
      <div
        className={css({
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '5',
        })}
      >
        <PlayAction
          documentId={documentId}
          durationMs={teaser.audioDurationMs ?? undefined}
          mp3={teaser.audioSourceMp3 ?? undefined}
          path={path}
          title={title}
        />
        <BookmarkAction documentId={documentId} />
        <DiscussionAction
          path={path}
          backendDiscussionId={teaser.discussion?.backendDiscussionId}
          inlineDiscussion={teaser.inlineDiscussion ?? false}
        />
      </div>

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
                  durationMs={teaser.audioDurationMs ?? undefined}
                  mp3={mp3}
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
