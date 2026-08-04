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
import { ShareAction } from './share-action'
import { useArticleActions } from './article-actions-context'

// Matches the header, so the bar and the header appear and disappear together.
const MAX_HEADER_HEIGHT = 100

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
  boxShadow: 'overlay',
  color: 'text',
  display: 'flex',
  gap: '5',
  paddingX: '5',
  paddingY: '3',

  opacity: 0,
  // `visibility` — unlike `opacity` alone — also takes the hidden bar out of the
  // tab order and the accessibility tree, where it would otherwise duplicate the
  // top and bottom action rows.
  visibility: 'hidden',
  transition: 'opacity 0.3s ease-out, visibility 0.3s ease-out',
  '&[data-visible]': {
    opacity: 1,
    visibility: 'visible',
  },

  '@media print': { display: 'none' },
})

export type ArticleFloatingActionsProps = {
  article: ArticleDocumentType
}

export function ArticleFloatingActions({
  article,
}: ArticleFloatingActionsProps) {
  const { audioPlayerVisible } = useAudioContext()
  const { paynoteInlineHeight } = usePaynotes()
  const { isIOSApp } = usePlatformInformation()
  const { topActionsCleared } = useArticleActions()

  const scrollDirection = useScrollDirection({
    upThreshold: 25,
    downThreshold: MAX_HEADER_HEIGHT,
  })

  // In the native app the page content sits inside `PullToRefresh`, which leaves
  // a `translateY(0)` transform on its wrapper after the first pull gesture —
  // that would make the wrapper, rather than the viewport, the containing block
  // for this fixed element. A body portal is immune to it.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

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

  // `scrollDirection` is null until the first threshold crossing, so the bar
  // starts out hidden.
  const visible = scrollDirection === 'up' && topActionsCleared

  return createPortal(
    <div
      ref={barRef}
      className={cx(panelStyle, isIOSApp && iosAppSafeAreaBottomStyle)}
      data-audio-visible={audioPlayerVisible || undefined}
      data-visible={visible || undefined}
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
      <BookmarkAction documentId={collectionsDocumentId(article)} />
      <ShareAction
        align='center'
        menuOffsetX={shareMenuOffset.x}
        menuSideOffset={shareMenuOffset.side}
        path={article.slug}
        title={article.plainTitle}
        triggerRef={shareTriggerRef}
      />
    </div>,
    document.body,
  )
}
