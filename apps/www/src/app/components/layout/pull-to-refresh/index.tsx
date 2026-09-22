'use client'

import { IconRefresh } from '@republik/icons'
import { css } from '@republik/theme/css'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useAudioContext } from '../../../../components/Audio/AudioProvider'

// eslint-disable-next-line no-unused-vars
enum IndicatorState {
  HIDDEN,
  PULLING,
  TRIGGERED,
  LOADING,
}

/**
 * Whether an overlay has locked page scrolling. Checked by feature rather than
 * by importing a lock hook, because two mechanisms are in play: Radix dialogs
 * lock via react-remove-scroll (which marks the body), the styleguide's
 * overlays via body-scroll-lock (which sets inline overflow). Without this a
 * downward drag on an open modal refreshes the route behind it — the legacy
 * pull-to-refresh guards the same way (see components/Frame/Pullable.js).
 */
function isPageScrollLocked() {
  return (
    document.body.hasAttribute('data-scroll-locked') ||
    document.body.style.overflow === 'hidden'
  )
}

/**
 * Hook to add a pull-to-refresh behavior to a container.
 * @param ref elementRef of the container
 * @param callback that is called when the user pulls down the container
 * @returns
 *
 * This hooks is based on the following article:
 * https://www.strictmode.io/articles/react-pull-to-refresh
 */
function usePullToRefresh(
  ref: React.RefObject<HTMLDivElement>,
  callback: () => void,
  options: {
    maxPullDistance?: number
    triggerThreshold?: number
    pullResistance?: number
    isDisabled?: boolean
  } = {},
) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const callbackRef = useRef<typeof callback>(() => {})
  const {
    maxPullDistance = 240,
    triggerThreshold = 240,
    pullResistance = 0.4,
    isDisabled = false,
  } = options

  const appr = useMemo<(_: number) => number>(
    () => (x: number) => {
      return (
        maxPullDistance *
        (1 - Math.exp((-pullResistance * x) / maxPullDistance))
      )
    },
    [maxPullDistance, pullResistance],
  )

  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    function handleTouchStart(startEvent: TouchEvent) {
      const el = ref.current
      if (!el || window.scrollY !== 0 || isDisabled) return

      // `touchstart` is bound to the window, so it also fires for the header,
      // the CTA banner and any overlay — none of which are inside `el`. Those
      // gestures must not arm a pull.
      const target = startEvent.target
      if (!(target instanceof Node) || !el.contains(target)) return

      if (isPageScrollLocked()) return

      // get the initial Y position
      const initialY = startEvent.touches[0].clientY

      el.style.transition = ''
      // Bound to the window rather than to `el`: a finger that leaves the
      // element mid-drag must still deliver `touchend`, or the listeners below
      // and `overscrollBehaviorY` would never be cleaned up.
      window.addEventListener('touchmove', handleTouchMove, { passive: true })
      window.addEventListener('touchend', handleTouchEnd)
      window.addEventListener('touchcancel', handleTouchEnd)
      document.documentElement.style.overscrollBehaviorY = 'none'
      document.documentElement.style.setProperty(
        '--pull-to-refresh-progress',
        '0',
      )

      function handleTouchMove(moveEvent: TouchEvent) {
        const el = ref.current
        if (!el) return

        // get the current Y position
        const currentY = moveEvent.touches[0].clientY
        const dy = currentY - initialY

        if (dy < 0) {
          return
        }

        const progress = Math.min(1, dy / triggerThreshold)
        document.documentElement.style.setProperty(
          '--pull-to-refresh-progress',
          progress.toString(),
        )

        if (dy > triggerThreshold * 0.1) {
          document.documentElement.setAttribute(
            'data-pull-to-refresh-state',
            'pulling',
          )
        }
        if (dy <= triggerThreshold) {
          el.style.transform = `translateY(${appr(dy)}px)`
        }
      }

      function resetState() {
        const el = ref.current
        if (!el) return

        // Return pulled element to original position
        el.style.transform = 'translateY(0)'
        el.style.transition = 'transform 0.2s ease-in-out'

        // Clean up attributes on <html> element
        document.documentElement.removeAttribute('data-pull-to-refresh-state')
        document.documentElement.style.overscrollBehaviorY = ''
        document.documentElement.style.setProperty(
          '--pull-to-refresh-progress',
          '',
        )
      }

      function handleTouchEnd(endEvent: TouchEvent) {
        const el = ref.current
        if (!el) return

        const currentY = endEvent.changedTouches[0].clientY
        const dy = currentY - initialY

        if (dy > triggerThreshold) {
          document.documentElement.setAttribute(
            'data-pull-to-refresh-state',
            'loading',
          )

          // Trigger refresh
          callbackRef?.current()
          // Let animation run for 1s
          setTimeout(resetState, 1000)
        } else {
          resetState()
        }
        // cleanup
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
        window.removeEventListener('touchcancel', handleTouchEnd)
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [ref.current, callbackRef, appr, triggerThreshold, isDisabled])
}

type PullToRefreshProps = {
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>

export function PullToRefresh({ children, ...props }: PullToRefreshProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { isExpanded: audioPlayerExpanded } = useAudioContext()

  const { refresh } = useRouter()

  const pullToRefresh = useCallback(() => {
    refresh()
  }, [refresh])

  usePullToRefresh(ref, pullToRefresh, {
    isDisabled: audioPlayerExpanded,
  })

  return (
    <div className={css({ position: 'relative' })}>
      <div
        className={css({
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          py: '4',
          backgroundColor: 'transparent',
          touchAction: 'none',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.2s ease-in-out',
          zIndex: 10,
        })}
      >
        <IconRefresh
          size='2rem'
          className={css({
            transform: 'scale(0.5) rotate(0deg)',
            opacity: 0,
            '[data-pull-to-refresh-state="pulling"] &': {
              opacity: `calc(var(--pull-to-refresh-progress, 0) * 100%)`,
              transform: `scale(calc(0.5 + calc(var(--pull-to-refresh-progress, 0) * 0.5))) rotate(calc(var(--pull-to-refresh-progress, 0) * 360deg))`,
              transition: 'transform 0.1s ease-out',
            },
            '[data-pull-to-refresh-state="loading"] &': {
              animation: 'spin',
              opacity: 1,
            },
          })}
        />
      </div>
      <div ref={ref} {...props}>
        {children}
      </div>
    </div>
  )
}
