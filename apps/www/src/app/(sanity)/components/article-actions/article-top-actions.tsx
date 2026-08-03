'use client'

import { ACTION_ICON_SIZE } from './action-style'
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
import { css } from '@republik/theme/css'
import { EllipsisVertical } from 'lucide-react'
import { useRef } from 'react'

export type ArticleTopActionsProps = {
  article: ArticleDocumentType
}

export function ArticleTopActions({ article }: ArticleTopActionsProps) {
  const documentId = collectionsDocumentId(article)
  const path = article.slug
  const title = article.plainTitle

  // The floating action bar stays hidden while this row is on screen.
  const ref = useRef<HTMLDivElement>(null)
  const { setTopActionsInView } = useArticleActions()
  useIntersectionObserver(ref, { callback: setTopActionsInView })

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
