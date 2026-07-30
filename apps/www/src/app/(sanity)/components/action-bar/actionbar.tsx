'use client'

import { ActionMenu } from '@/app/components/ui/action-menu'
import type { ArticleDocumentType } from '@/app/(sanity)/groq/document-query'
import { css } from '@republik/theme/css'
import { EllipsisVertical } from 'lucide-react'
import { ACTION_ICON_SIZE } from './action-buttons/action-button'
import { BookmarkButton } from './action-buttons/bookmark-button'
import { PdfDownloadItem } from './action-buttons/pdf-download-item'
import { PlayButton } from './action-buttons/play-button'
import { ShareButton } from './action-buttons/share-button'
import { audioQueueDocumentId, collectionsDocumentId } from './document-id'

export type ActionBarProps = {
  article: ArticleDocumentType
}

export function ActionBar({ article }: ActionBarProps) {
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

      <ActionMenu
        title='Weitere Aktionen'
        trigger={<EllipsisVertical size={ACTION_ICON_SIZE} />}
      >
        <PdfDownloadItem path={path} version={article._updatedAt} />
      </ActionMenu>
    </div>
  )
}
