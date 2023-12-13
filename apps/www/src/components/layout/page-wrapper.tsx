'use client'

import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'
import { css } from '@app/styled-system/css'
import throttle from 'lodash/throttle'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useRef } from 'react'

const MAX = 200
const k = 0.6

function appr(x: number) {
  return MAX * (1 - Math.exp((-k * x) / MAX))
}

const TRIGGER_THRESHOLD = 160

type PageWrapperProps = {
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>

export function PullToRefresh({ children, ...props }: PageWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [showIndicator, setShowIndicator] = React.useState(false)
  const [flipIndicator, setFlipIndicator] = React.useState(false)
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
      true
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
          setShowIndicator(false)
          return
        }

        if (dy > TRIGGER_THRESHOLD / 0.3) {
          setShowIndicator(true)
        }

        if (dy > TRIGGER_THRESHOLD / 0.8) {
          setFlipIndicator(true)
        }

        if (dy > TRIGGER_THRESHOLD) {
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
        setShowIndicator(false)
        setFlipIndicator(false)

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
          transform: showIndicator ? 'translateY(0)' : 'translateY(-300%)',
        }}
      >
        <svg
          className={css({
            transition: 'transform 0.2s ease-in-out',
          })}
          width='24'
          height='
          24'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          style={{
            transform: flipIndicator ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path
            d='M12 5V19'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M19 12L12 19L5 12'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
        {/* <span style={{ marginLeft: '8px' }}>Pull to refresh</span> */}
      </div>
      {children}
    </div>
  )
}
