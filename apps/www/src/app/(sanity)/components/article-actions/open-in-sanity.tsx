'use client'

import { editUrl } from '@/app/(sanity)/lib/edit-url'
import { useMe } from '@/lib/context/MeContext'
import { cx } from '@republik/theme/css'
import { Pencil } from 'lucide-react'
import { ACTION_ICON_SIZE, actionStyle } from './action-style'

export function OpenInSanityAction({
  documentId,
  documentType,
  className,
}: {
  documentId: string
  documentType: string
  className?: string
}) {
  const { isEditor } = useMe()

  if (!isEditor) {
    return null
  }

  return (
    <a
      className={cx(actionStyle, className)}
      href={editUrl({
        documentId,
        documentType,
      })}
      rel='noopener noreferrer'
      target='_blank'
    >
      <Pencil size={ACTION_ICON_SIZE} />
      Im Studio öffnen
    </a>
  )
}
