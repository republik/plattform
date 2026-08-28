'use client'

import { usePaynotes } from '@/app/(sanity)/components/paynotes/paynotes-context'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { PUBLIC_BASE_URL, SCREENSHOT_SERVER_BASE_URL } from '@/lib/constants'
import { cx } from '@republik/theme/css'
import { FileDown } from 'lucide-react'
import { ACTION_ICON_SIZE, actionStyle } from './action-style'

function getArticlePdfUrl({
  path,
  version,
}: {
  path: string
  version?: string
}): string {
  const pdfUrl = new URL('/api/pdf', SCREENSHOT_SERVER_BASE_URL)
  pdfUrl.searchParams.set('url', new URL(path, PUBLIC_BASE_URL).toString())
  if (version) {
    pdfUrl.searchParams.set('version', version)
  }
  pdfUrl.searchParams.set('images', 'true')
  pdfUrl.searchParams.set('format', 'A4')
  return pdfUrl.toString()
}

export function PdfDownloadAction({
  path,
  version,
  className,
}: {
  path: string
  version?: string
  /** Overrides the standalone look, e.g. when embedded in a menu. */
  className?: string
}) {
  const trackEvent = useTrackEvent()
  const { hasPaywall } = usePaynotes()
  const pdfHref = getArticlePdfUrl({ path, version })

  // Not signed in, or trial ended: reader is looking at a paywall, so the
  // full text isn't theirs to download.
  if (hasPaywall) {
    return null
  }

  return (
    <a
      className={cx(actionStyle, className)}
      href={pdfHref}
      onClick={() => trackEvent({ action: 'pdfDownload', name: path })}
      rel='noopener noreferrer'
      target='_blank'
    >
      <FileDown size={ACTION_ICON_SIZE} />
      PDF herunterladen
    </a>
  )
}
