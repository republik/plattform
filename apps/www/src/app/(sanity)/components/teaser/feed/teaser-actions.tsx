'use client'

import { ACTION_ICON_SIZE } from '@/app/(sanity)/components/article-actions/action-style'
import {
  AddToPlaylistAction,
  useAddToPlaylistAllowed,
} from '@/app/(sanity)/components/article-actions/add-to-playlist-action'
import { BookmarkAction } from '@/app/(sanity)/components/article-actions/bookmark-action'
import { useReadingPosition } from '@/app/(sanity)/components/article-actions/continue-reading-action'
import { DiscussionAction } from '@/app/(sanity)/components/article-actions/discussion-action'
import { collectionsDocumentId } from '@/app/(sanity)/components/article-actions/document-id'
import {
  MENU_SIDE_OFFSET,
  menuTriggerStyle,
} from '@/app/(sanity)/components/article-actions/menu-style'
import { PlayAction } from '@/app/(sanity)/components/article-actions/play-action'
import type { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import { Menu, menuItemStyle } from '@/app/components/ui/responsive-menu'
import { css } from '@republik/theme/css'
import { CheckIcon, EllipsisVertical } from 'lucide-react'

export function TeaserActions({ teaser }: { teaser: TeaserListItemType }) {
  const audioItem = teaser._type === 'article' ? teaser.audioItem : null
  const showAddToPlaylist = useAddToPlaylistAllowed(
    audioItem?.audioSourceMp3 ?? undefined,
  )
  const documentId = collectionsDocumentId(teaser)
  const progress = useReadingPosition({ documentId })

  // Only articles carry audio/discussion data, and standalone teaser
  // documents point at other content — there's nothing of their own to
  // play, bookmark, or discuss.
  if (teaser._type !== 'article') {
    return null
  }

  const path = teaser.slug

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
        <PlayAction audioItem={audioItem} />
        <BookmarkAction documentId={documentId} />
        <DiscussionAction
          path={path}
          backendDiscussionId={teaser.discussion?.backendDiscussionId}
          inlineDiscussion={teaser.inlineDiscussion ?? false}
        />
        {showAddToPlaylist && (
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
              <Menu.Item asChild>
                <AddToPlaylistAction
                  audioItem={audioItem}
                  className={menuItemStyle}
                />
              </Menu.Item>
            </Menu.Content>
          </Menu.Root>
        )}
      </div>

      <div className={css({ display: 'flex', gap: '5', alignItems: 'center' })}>
        {progress?.percent !== undefined && (
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '0.2em',
              fontSize: 's',
              color: 'textSoft',
            })}
          >
            {progress.read ? (
              <>
                <CheckIcon size={ACTION_ICON_SIZE} />
                gelesen
              </>
            ) : (
              `${progress.percent} % gelesen`
            )}{' '}
          </div>
        )}
      </div>
    </div>
  )
}
