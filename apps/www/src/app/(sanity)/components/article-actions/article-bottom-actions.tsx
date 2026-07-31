'use client'

import { ACTION_ICON_SIZE } from './action-style'
import { BookmarkAction } from './bookmark-action'
import { collectionsDocumentId } from './document-id'
import { PdfDownloadAction } from './pdf-download-action'
import { ShareAction } from './share-action'
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

export type ArticleBottomActionsProps = {
  article: ArticleDocumentType
}

export function ArticleBottomActions({ article }: ArticleBottomActionsProps) {
  const documentId = collectionsDocumentId(article)
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
      <BookmarkAction documentId={documentId} />
      <ShareAction title={title} path={path} />

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
