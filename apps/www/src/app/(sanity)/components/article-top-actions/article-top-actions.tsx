'use client'

import { ACTION_ICON_SIZE } from '@/app/(sanity)/components/actions/action-style'
import { BookmarkAction } from '@/app/(sanity)/components/actions/bookmark-action'
import { DiscussionAction } from '@/app/(sanity)/components/actions/discussion-action'
import { PdfDownloadAction } from '@/app/(sanity)/components/actions/pdf-download-action'
import { PlayAction } from '@/app/(sanity)/components/actions/play-action'
import { ShareAction } from '@/app/(sanity)/components/actions/share-action'
import type { ArticleDocumentType } from '@/app/(sanity)/groq/document-query'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { css } from '@republik/theme/css'
import { EllipsisVertical } from 'lucide-react'

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

export type ArticleTopActionsProps = {
  article: ArticleDocumentType
}

export function ArticleTopActions({ article }: ArticleTopActionsProps) {
  const documentId = collectionsDocumentId(article)
  const audioDocumentId = audioQueueDocumentId(article)
  const path = article.slug
  const title = article.plainTitle

  return (
    <div
      className={css({
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5',
      })}
    >
      <PlayAction
        documentId={audioDocumentId}
        durationMs={article.audioDurationMs ?? undefined}
        mp3={article.audioSourceMp3 ?? undefined}
        path={path}
        sanityId={article._id}
        title={title}
      />
      <BookmarkAction documentId={documentId} />
      <ShareAction title={title} path={path} />
      <DiscussionAction path={path} />

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
              <PdfDownloadAction
                path={path}
                version={article._updatedAt}
                className={menuItemStyle}
              />
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}
