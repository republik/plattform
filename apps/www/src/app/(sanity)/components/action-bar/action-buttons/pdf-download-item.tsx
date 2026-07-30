'use client'

import { ActionMenuItem } from '@/app/components/ui/action-menu'
import { getArticlePdfUrl } from '@/app/(sanity)/components/action-bar/pdf-url'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { FileDown } from 'lucide-react'
import { ACTION_ICON_SIZE } from './action-button'

export function PdfDownloadItem({
  path,
  version,
}: {
  path: string
  version?: string
}) {
  const trackEvent = useTrackEvent()
  const pdfHref = getArticlePdfUrl({ path, version })

  return (
    <ActionMenuItem
      href={pdfHref}
      icon={<FileDown size={ACTION_ICON_SIZE} />}
      onSelect={() => trackEvent({ action: 'pdfDownload', name: path })}
      target='_blank'
    >
      PDF herunterladen
    </ActionMenuItem>
  )
}
