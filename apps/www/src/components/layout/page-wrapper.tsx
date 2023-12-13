'use client'

import { css } from '@app/styled-system/css'
import { IconArrowDownward } from '@republik/icons'
import throttle from 'lodash/throttle'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useRef } from 'react'

const MAX = 240
const k = 0.6

function appr(x: number) {
  return MAX * (1 - Math.exp((-k * x) / MAX))
}

const TRIGGER_THRESHOLD = MAX / 0.5

enum IndicatorState {
  HIDDEN,
  PULLING,
  PULLED,
  SPINNER,
}

type PullToRefreshProps = {
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>

export function PullToRefresh({ children, ...props }: PullToRefreshProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [indicatorState, setIndicatorState] = React.useState<IndicatorState>(
    IndicatorState.HIDDEN,
  )
  const { refresh } = useRouter()

  const pullToRefresh = useCallback(
    throttle(() => {
      console.log('Pull to refresh')
    }, 1000),
    [refresh],
  )

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }
    element.style.transition = 'transform 0.2s ease-in-out'

    function handleTouchStart(startEvent: TouchEvent) {
      const el = ref.current
      if (!el || window.scrollY !== 0) return
      console.log('handleTouchStart')

      // get the initial Y position
      const initialY = startEvent.touches[0].clientY

      el.addEventListener('touchmove', handleTouchMove)
      el.addEventListener('touchend', handleTouchEnd)

      function handleTouchMove(moveEvent: TouchEvent) {
        const el = ref.current
        if (!el) return

        // get the current Y position
        const currentY = moveEvent.touches[0].clientY

        // get the difference
        const dy = currentY - initialY

        if (dy < 0) {
          setIndicatorState(IndicatorState.HIDDEN)
          return
        }

        if (dy > TRIGGER_THRESHOLD / 0.3) {
          setIndicatorState(IndicatorState.PULLING)
        }

        if (dy > TRIGGER_THRESHOLD / 0.8) {
          setIndicatorState(IndicatorState.PULLED)
        }

        if (dy > TRIGGER_THRESHOLD) {
          setIndicatorState(IndicatorState.SPINNER)
          pullToRefresh()
        }

        // now we are using the `appr` function
        el.style.transform = `translateY(${appr(dy)}px)`
      }

      function handleTouchEnd() {
        const el = ref.current
        if (!el) return

        // return the element to its initial position
        el.style.transform = 'translateY(0)'

        // add transition
        el.style.transition = 'transform 0.2s'

        // listen for transition end event
        el.addEventListener('transitionend', onTransitionEnd)

        // cleanup
        el.removeEventListener('touchmove', handleTouchMove)
        el.removeEventListener('touchend', handleTouchEnd)
      }

      function onTransitionEnd() {
        const el = ref.current
        if (!el) return
        setIndicatorState(IndicatorState.HIDDEN)

        // remove transition
        el.style.transition = ''

        // cleanup
        el.removeEventListener('transitionend', onTransitionEnd)
      }
    }

    window.addEventListener('touchstart', handleTouchStart)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [ref.current, pullToRefresh])

  return (
    <div ref={ref} {...props}>
      <div
        className={css({
          position: 'absolute',
          top: '16px',
          left: '0',
          width: '100%',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-lighter)',
          transition: 'transform 0.2s ease-in-out',
          zIndex: 10,
        })}
        style={{
          transform:
            indicatorState == IndicatorState.SPINNER
              ? 'translateY(-150%)'
              : indicatorState >= IndicatorState.PULLING
              ? 'translateY(0)'
              : 'translateY(-300%)',
        }}
      >
        <IconArrowDownward
          size='3rem'
          style={{
            transform:
              indicatorState >= IndicatorState.PULLED
                ? 'rotate(180deg)'
                : 'rotate(0deg)',
          }}
        />
        {/* <span style={{ marginLeft: '8px' }}>Pull to refresh</span> */}
      </div>
      {children}
    </div>
  )
}
