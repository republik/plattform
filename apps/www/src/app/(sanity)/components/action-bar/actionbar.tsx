'use client'

import { ACTION_ICON_SIZE } from '@/app/(sanity)/components/action-buttons/action-button-style'
import { BookmarkButton } from '@/app/(sanity)/components/action-buttons/bookmark-button'
import { PdfDownloadButton } from '@/app/(sanity)/components/action-buttons/pdf-download-button'
import { PlayButton } from '@/app/(sanity)/components/action-buttons/play-button'
import { ReadingPositionButton } from '@/app/(sanity)/components/action-buttons/reading-position-button'
import { ShareButton } from '@/app/(sanity)/components/action-buttons/share-button'
import type { ArticleDocumentType } from '@/app/(sanity)/groq/document-query'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { useTranslation } from '@/lib/withT'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { css } from '@republik/theme/css'
import { CircleCheck, EllipsisVertical } from 'lucide-react'
import { useReadingPosition } from './use-reading-position'

const menuTriggerStyle = css({
  cursor: 'pointer',
  display: 'inline-flex',
})

const menuPanelStyle = css({
  backgroundColor: 'background.overlay',
  boxShadow: 'md',
  color: 'text',
  minWidth: '12rem',
  paddingY: '2',
  _stateOpen: { animation: 'fadeIn' },
  _stateClosed: { animation: 'fadeOut' },
})

const menuItemStyle = css({
  alignItems: 'center',
  color: 'text',
  cursor: 'pointer',
  display: 'flex',
  gap: '3',
  fontSize: 's',
  fontWeight: 'regular',
  outline: 'none',
  paddingX: '5',
  paddingY: '3',
  textAlign: 'left',
  textDecoration: 'none',
  textStyle: 'sans',
  width: 'full',
  '&[data-highlighted], &:hover': {
    backgroundColor: 'hover',
  },
  '&[data-disabled], &:disabled': {
    color: 'disabled',
    cursor: 'not-allowed',
  },
  '& > svg': {
    flexShrink: 0,
  },
})

/**
 * Reference for bookmarks and reading position.
 *
 * Preview renders draft documents, whose `_id` carries a `drafts.` prefix.
 * Collections must key off the published id, or a reader's bookmark would
 * depend on how they happened to open the article.
 */
function collectionsDocumentId(article: { _id: string }): string {
  return `sanity:${article._id.replace(/^drafts\./, '')}`
}

/**
 * Reference for the audio queue.
 *
 * Today the API derives the repo from a base64-encoded document id — see the
 * `addAudioQueueItem` resolver in `packages/backend-modules/collections`.
 * Returns undefined when the article has no `repoId`, which is the signal that
 * the audio queue cannot be offered for it.
 */
function audioQueueDocumentId(article: {
  repoId?: string | null
}): string | undefined {
  const { repoId } = article
  if (!repoId) {
    return undefined
  }
  return btoa(repoId)
}

export type ActionBarProps = {
  article: ArticleDocumentType
}

export function ActionBar({ article }: ActionBarProps) {
  const documentId = collectionsDocumentId(article)
  const audioDocumentId = audioQueueDocumentId(article)
  const path = article.slug
  const title = article.plainTitle
  const { t } = useTranslation()
  const trackEvent = useTrackEvent()
  const { percent, isRead, position, markAsRead } = useReadingPosition({
    documentId,
  })

  return (
    <div
      className={css({
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5',
      })}
    >
      <PlayButton
        documentId={audioDocumentId}
        durationMs={article.audioDurationMs ?? undefined}
        mp3={article.audioSourceMp3 ?? undefined}
        path={path}
        sanityId={article._id}
        title={title}
      />
      <BookmarkButton documentId={documentId} />
      <ShareButton title={title} path={path} />
      <ReadingPositionButton
        isRead={isRead}
        percent={percent}
        position={position}
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
            sideOffset={8}
            collisionPadding={16}
            className={menuPanelStyle}
          >
            <DropdownMenu.Item asChild>
              <PdfDownloadButton
                path={path}
                version={article._updatedAt}
                className={menuItemStyle}
              />
            </DropdownMenu.Item>
            {/* Hidden once the article is read — there is nothing left to mark. */}
            {markAsRead && !isRead && (
              <DropdownMenu.Item
                className={menuItemStyle}
                onSelect={() => {
                  markAsRead()
                  trackEvent({ action: 'markAsRead', name: path })
                }}
              >
                <CircleCheck size={ACTION_ICON_SIZE} />
                {t('article/actionbar/progress/markasread')}
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}
