import { useEffect, useMemo, useRef, useState } from 'react'

// eslint-disable-next-line no-unused-vars
export enum IndicatorState {
  HIDDEN,
  PULLING,
  TRIGGERED,
  LOADING,
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
export function usePullToRefresh(
  ref: React.RefObject<HTMLDivElement>,
  callback: () => void,
  options: {
    maxPullDistance?: number
    triggerThreshold?: number
    pullResistance?: number
  } = {
    maxPullDistance: 240,
    triggerThreshold: 240,
    pullResistance: 0.6,
  },
): IndicatorState {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const callbackRef = useRef<typeof callback>(() => {})
  const [indicatorState, setIndicatorState] = useState<IndicatorState>(
    IndicatorState.HIDDEN,
  )
  const { maxPullDistance, triggerThreshold, pullResistance } = options

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
    element.style.transition = 'transform 0.2s ease-in-out'

    console.log(indicatorState)

    function handleTouchStart(startEvent: TouchEvent) {
      const el = ref.current
      if (!el || window.scrollY !== 0) return

      // get the initial Y position
      const initialY = startEvent.touches[0].clientY

      el.addEventListener('touchmove', handleTouchMove, { passive: true })
      el.addEventListener('touchend', handleTouchEnd)
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
          setIndicatorState(IndicatorState.HIDDEN)
          return
        }

        const progress = Math.min(1, dy / triggerThreshold)
        document.documentElement.style.setProperty(
          '--pull-to-refresh-progress',
          progress.toString(),
        )

        if (dy > triggerThreshold * 0.3) {
          console.log('pulling')
          setIndicatorState(IndicatorState.PULLING)
        }

        if (dy > triggerThreshold) {
          console.log('triggered')
          setIndicatorState(IndicatorState.TRIGGERED)
        }

        el.style.transform = `translateY(${appr(dy)}px)`
      }

      function handleTouchEnd(endEvent: TouchEvent) {
        const el = ref.current
        if (!el) return

        const currentY = endEvent.changedTouches[0].clientY
        const dy = currentY - initialY

        if (dy > triggerThreshold) {
          setIndicatorState(IndicatorState.LOADING)
          callbackRef?.current()
        }

        // return the element to its initial position
        el.style.transform = 'translateY(0)'
        el.style.transition = 'transform 0.2s ease-in-out'

        el.addEventListener('transitionend', onTransitionEnd)

        // cleanup
        el.removeEventListener('touchmove', handleTouchMove)
        el.removeEventListener('touchend', handleTouchEnd)
        document.documentElement.style.overscrollBehaviorY = null
        document.documentElement.style.setProperty(
          '--pull-to-refresh-progress',
          '',
        )
      }

      function onTransitionEnd() {
        const el = ref.current
        if (!el) return

        setIndicatorState(IndicatorState.HIDDEN)
        el.style.transition = null
        // cleanup
        el.removeEventListener('transitionend', onTransitionEnd)
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [ref.current, callbackRef, appr, triggerThreshold])

  return indicatorState
}
