'use client'

import { usePaynotes } from '@/app/(sanity)/components/paynotes/paynotes-context'
import type { ArticleDocumentType } from '@/app/(sanity)/groq/document-query'
import { usePlatformInformation } from '@/app/lib/hooks/usePlatformInformation'
import { useScrollDirection } from '@/app/lib/hooks/useScrollDirection'
import { iosAppSafeAreaBottomStyle } from '@/app/lib/styles/ios-app-safe-area'
import { useAudioContext } from '@/components/Audio/AudioProvider'
import { css, cx } from '@republik/theme/css'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { BookmarkAction } from './bookmark-action'
import { collectionsDocumentId } from './document-id'
import { MENU_SIDE_OFFSET } from './menu-style'
import {
  ReadStatus,
  ResumeButton,
  useNearTop,
  useReadingPosition,
} from './continue-reading-action'
import { ReadingProgressAction } from './reading-progress-action'
import { ShareAction } from './share-action'
import { useArticleActions } from './article-actions-context'

// Matches the header, so the bar and the header appear and disappear together.
const MAX_HEADER_HEIGHT = 100

// The panel's opacity fade (`panelStyle`).
const FADE_MS = 300

// The viewport's negative margin (`viewportStyle`): it reaches past the
// content so focus rings aren't clipped.
const VIEWPORT_BLEED = 4

const panelStyle = css({
  position: 'fixed',
  left: '50%',
  transform: 'translateX(-50%)',
  maxWidth: 'calc(100% - 32px)',

  // Vertical offset, bottom up:
  //   15px                         same gap from the edge as the mini audio player
  //   env(safe-area-inset-bottom)  home indicator; 0 unless the viewport opts into
  //                                `viewport-fit=cover` (see the iOS app note below)
  //   --paynote-inline-height      height of the fixed paynote bar, measured in JS
  //   83px / 98px                  mini audio player (68px) plus its own margin,
  //                                which is 15px on mobile and 30px from `md` up
  '--paynote-inline-height': '0px',
  bottom:
    'calc(15px + env(safe-area-inset-bottom, 0px) + var(--paynote-inline-height))',
  '&[data-audio-visible]': {
    bottom:
      'calc(15px + 83px + env(safe-area-inset-bottom, 0px) + var(--paynote-inline-height))',
    md: {
      bottom:
        'calc(15px + 98px + env(safe-area-inset-bottom, 0px) + var(--paynote-inline-height))',
    },
  },

  // Deliberately below the audio player (41), so the expanded full-screen player
  // covers the bar instead of the bar punching through it. The two never overlap
  // in the mini state thanks to the offset above. Also below the paynote bar
  // (9998), which the offset clears as well.
  zIndex: 20,

  alignItems: 'center',
  backgroundColor: 'background.overlay',
  borderRadius: 'full',
  // As on the mini audio player: `md` reads too heavy over article content.
  boxShadow: 'overlay',
  color: 'text',
  display: 'flex',
  paddingX: '5',
  paddingY: '3',

  opacity: 0,
  // `visibility` — unlike `opacity` alone — also takes the hidden bar out of the
  // tab order and the accessibility tree, where it would otherwise duplicate the
  // top and bottom action rows.
  visibility: 'hidden',
  transition:
    'opacity 0.3s ease-out, visibility 0.3s ease-out, background-color 0.3s ease-out, color 0.3s ease-out',
  '&[data-visible]': {
    opacity: 1,
    visibility: 'visible',
  },
  // The offer made at the top stands out from the actions further down.
  '&[data-mode="resume"], &[data-mode="read"]': {
    backgroundColor: 'contrast',
    color: 'text.inverted',
  },

  '@media print': { display: 'none' },
})

// Clips the slots while the width animates between them.
const viewportStyle = css({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  margin: '-4px',
  overflow: 'hidden',
  padding: '4px',
  position: 'relative',
  transition: 'width 300ms ease-out',
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
})

// All slots share the spot; the inactive ones sit centred on top of the active
// one, out of the flow, and crossfade.
const slotStyle = css({
  alignItems: 'center',
  display: 'flex',
  flexShrink: 0,
  gap: '5',
  left: '50%',
  opacity: 0,
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  transition: 'opacity 200ms ease-out, visibility 0s linear 200ms',
  visibility: 'hidden',
  width: 'max-content',
  '&[data-active]': {
    left: 'auto',
    opacity: 1,
    position: 'relative',
    top: 'auto',
    transform: 'none',
    transition: 'opacity 200ms ease-out 100ms',
    visibility: 'visible',
  },
})

export type ArticleFloatingActionsProps = {
  article: ArticleDocumentType
}

type Mode = 'resume' | 'read' | 'actions'

export function ArticleFloatingActions({
  article,
}: ArticleFloatingActionsProps) {
  const { audioPlayerVisible } = useAudioContext()
  const { paynoteInlineHeight } = usePaynotes()
  const { isIOSApp } = usePlatformInformation()
  const { topActionsCleared } = useArticleActions()
  const documentId = collectionsDocumentId(article)
  const progress = useReadingPosition({ documentId })
  const nearTop = useNearTop()

  const scrollDirection = useScrollDirection({
    upThreshold: 25,
    downThreshold: MAX_HEADER_HEIGHT,
  })

  // In the native app the page content sits inside `PullToRefresh`, which
  // transforms its wrapper while a pull is in progress — that makes the
  // wrapper, rather than the viewport, the containing block for this fixed
  // element. A body portal is immune to it.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // At the top the pill offers the stored position; further down, the actions.
  const top = nearTop && !topActionsCleared
  const topMode: Mode | undefined = progress.read
    ? 'read'
    : progress.resumeAt
    ? 'resume'
    : undefined
  const nextMode: Mode | undefined = top
    ? topMode
    : topActionsCleared && scrollDirection === 'up'
    ? 'actions'
    : undefined

  // The content last shown. It stays while the pill fades out, then switches
  // to what the pill will most likely show next, so that swap happens out of
  // sight.
  const [shownMode, setShownMode] = useState<Mode>('actions')
  const [hasFocus, setHasFocus] = useState(false)
  // Content doesn't swap under a focused control; hiding still does.
  const mode =
    nextMode && hasFocus && nextMode !== shownMode ? shownMode : nextMode
  const visible = mode !== undefined
  const displayMode = mode ?? shownMode
  const pendingMode = top ? topMode : 'actions'

  useEffect(() => {
    if (mode) {
      setShownMode(mode)
      return
    }
    setHasFocus(false)
    if (!pendingMode) {
      return
    }
    const timeout = setTimeout(() => setShownMode(pendingMode), FADE_MS)
    return () => clearTimeout(timeout)
  }, [mode, pendingMode])

  // The position moves while the reader reads, so re-read it every time they
  // come back to the top, the only moment it is offered.
  const { refresh } = progress
  const wasTop = useRef(top)
  useEffect(() => {
    const returned = top && !wasTop.current
    wasTop.current = top
    if (returned) {
      refresh?.()
    }
  }, [top, refresh])

  // CSS can't transition `width: auto`, so the width of each slot is measured
  // and the pill animates between them.
  const [slotWidths, setSlotWidths] = useState<Partial<Record<Mode, number>>>(
    {},
  )
  const viewportRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }
    const observer = new ResizeObserver((entries) => {
      setSlotWidths((widths) => {
        const next = { ...widths }
        for (const entry of entries) {
          const slot = (entry.target as HTMLElement).dataset.slot as Mode
          next[slot] = entry.borderBoxSize[0].inlineSize
        }
        return next
      })
    })
    viewport
      .querySelectorAll('[data-slot]')
      .forEach((slot) => observer.observe(slot))
    return () => observer.disconnect()
  }, [mounted, progress.read, progress.resumeAt])
  const slotWidth = slotWidths[displayMode]

  // Radix anchors the share menu to the share button, but the menu should read
  // as a surface next to the *bar*: centred on it horizontally, and clearing its
  // padding vertically. Both are measured, because they depend on rendered
  // widths. Remeasured whenever the bar resizes: at the `md` breakpoint where
  // the labels appear, and when the bookmark label flips to "Gemerkt".
  const barRef = useRef<HTMLDivElement>(null)
  const shareTriggerRef = useRef<HTMLButtonElement>(null)
  const [shareMenuOffset, setShareMenuOffset] = useState({
    x: 0,
    side: MENU_SIDE_OFFSET,
  })

  useEffect(() => {
    const bar = barRef.current
    const trigger = shareTriggerRef.current
    if (!bar || !trigger) {
      return
    }

    const measure = () => {
      const barRect = bar.getBoundingClientRect()
      const triggerRect = trigger.getBoundingClientRect()
      setShareMenuOffset({
        x: Math.round(
          barRect.left +
            barRect.width / 2 -
            (triggerRect.left + triggerRect.width / 2),
        ),
        // Half the leftover height is the bar's vertical padding. Using it
        // rather than the top inset keeps this correct whichever side Radix
        // flips the menu to.
        side:
          MENU_SIDE_OFFSET +
          Math.round((barRect.height - triggerRect.height) / 2),
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(bar)
    return () => observer.disconnect()
  }, [mounted])

  if (!mounted) {
    return null
  }

  const slotProps = (slot: Mode) => {
    const active = slot === displayMode
    return {
      className: slotStyle,
      'data-active': active || undefined,
      'data-slot': slot,
      inert: !active,
    }
  }

  return createPortal(
    <div
      ref={barRef}
      className={cx(panelStyle, isIOSApp && iosAppSafeAreaBottomStyle)}
      data-audio-visible={audioPlayerVisible || undefined}
      data-mode={displayMode}
      data-visible={visible || undefined}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setHasFocus(false)
        }
      }}
      onFocus={() => setHasFocus(true)}
      style={
        {
          // A non-finite value would invalidate the whole `calc()` and drop the
          // bar to the top of the viewport.
          '--paynote-inline-height': `${
            Number.isFinite(paynoteInlineHeight) ? paynoteInlineHeight : 0
          }px`,
        } as CSSProperties
      }
    >
      <div
        className={viewportStyle}
        ref={viewportRef}
        style={
          slotWidth === undefined
            ? undefined
            : { width: slotWidth + 2 * VIEWPORT_BLEED }
        }
      >
        {progress.resumeAt !== undefined && !progress.read && (
          <div {...slotProps('resume')}>
            <ResumeButton resumeAt={progress.resumeAt} />
          </div>
        )}
        {progress.read && (
          <div {...slotProps('read')}>
            <ReadStatus />
          </div>
        )}
        <div {...slotProps('actions')}>
          <ReadingProgressAction />
          <BookmarkAction documentId={documentId} />
          <ShareAction
            align='center'
            menuOffsetX={shareMenuOffset.x}
            menuSideOffset={shareMenuOffset.side}
            path={article.slug}
            title={article.plainTitle}
            triggerRef={shareTriggerRef}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
