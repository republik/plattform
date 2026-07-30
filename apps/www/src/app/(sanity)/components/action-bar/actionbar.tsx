'use client'

import { ActionMenu, ActionMenuItem } from '@/app/components/ui/action-menu'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { useMe } from '@/lib/context/MeContext'
import { css } from '@republik/theme/css'
import { EllipsisVertical, FileDown } from 'lucide-react'
import { ACTION_ICON_SIZE } from './action-buttons/action-button'
import { BookmarkButton } from './action-buttons/bookmark-button'
import { PlayButton } from './action-buttons/play-button'
import { ShareButton } from './action-buttons/share-button'

export type ActionBarProps = {
  sanityId: string
  /** `sanity:<_id>` reference for bookmarks and reading position. */
  documentId: string
  /**
   * Base64 `repoId` for the audio queue, which does not accept Sanity
   * references yet; undefined without a `repoId`.
   */
  audioDocumentId?: string
  path: string
  title: string
  /** Absolute public URL, built server-side. */
  shareUrl: string
  /** Screenshot-server PDF URL, built server-side. */
  pdfHref: string
  audio?: { mp3?: string; durationMs?: number }
  /** Membership as known on the server, so first paint is already correct. */
  initialIsMember: boolean
  initialCanBookmark: boolean
}

export function ActionBar({
  sanityId,
  documentId,
  audioDocumentId,
  path,
  title,
  shareUrl,
  pdfHref,
  audio,
  initialCanBookmark,
}: ActionBarProps) {
  const trackEvent = useTrackEvent()

  // Seed from the server, then defer to the live context once it has loaded —
  // a pure server value would leave these buttons stale after signing in
  // without a router refresh.
  const {
    isMember: liveIsMember,
    hasActiveMembership: liveHasMembership,
    meLoading,
  } = useMe()
  const canBookmark = meLoading
    ? initialCanBookmark
    : liveIsMember && liveHasMembership

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
        durationMs={audio?.durationMs}
        mp3={audio?.mp3}
        path={path}
        sanityId={sanityId}
        title={title}
      />
      <BookmarkButton canBookmark={canBookmark} documentId={documentId} />
      <ShareButton title={title} url={shareUrl} />

      <ActionMenu
        title='Weitere Aktionen'
        trigger={<EllipsisVertical size={ACTION_ICON_SIZE} />}
      >
        <ActionMenuItem
          href={pdfHref}
          icon={<FileDown size={ACTION_ICON_SIZE} />}
          onSelect={() => trackEvent({ action: 'pdfDownload', name: path })}
          target='_blank'
        >
          PDF herunterladen
        </ActionMenuItem>
      </ActionMenu>
    </div>
  )
}
