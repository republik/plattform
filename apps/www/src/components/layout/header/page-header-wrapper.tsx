'use client'

import React, { UIEvent, useEffect } from 'react'

type PageHeaderWrapperProps = {
  children: React.ReactNode
  elementRef: React.RefObject<HTMLDivElement>
}

/**
 * This components sole purpose is to wrap the page header and when scrolling up on the page
 * showing the page header again. If the user scrolls down the page header will be faded out.
 */
export default function PageHeaderWrapper({
  children,
  elementRef,
}: PageHeaderWrapperProps) {
  const elemRef = React.useRef<HTMLDivElement>(null)
  const previousY = React.useRef(0)
  const [applySticky, setApplySticky] = React.useState(false)
  const [elementHeight, setElementHeight] = React.useState(0)

  useEffect(() => {
    setElementHeight(elemRef.current?.offsetHeight)
  }, [elementRef])

  useScroll((e) => {
    const direction = e.y > previousY.current ? 'down' : 'up'
    if (direction === 'up') {
      if (!applySticky) {
        setApplySticky(true)
      }
    } else if (direction === 'down') {
      if (applySticky) {
        setApplySticky(false)
      }
    }

    previousY.current = e.y
  })

  return (
    <div
      ref={elemRef}
      style={{
        // @ts-expect-error --element-height is a custom property
        '--element-height': elementHeight + 'px',
        ...(applySticky
          ? {
              top: 0,
              position: 'sticky',
              zIndex: 100,
              animationName: 'fadeInElementFromTop',
              animationDuration: '.3s',
            }
          : {
              top: 0,
              zIndex: 100,
              animationName: 'fadeOutElementToTop',
              animationDuration: '.3s',
            }),
      }}
    >
      {children}
    </div>
  )
}

type ScrollEvent = {
  x: number
  y: number
  e: UIEvent<HTMLElement>
}

function useScroll(callback: (_: ScrollEvent) => void) {
  const callbackRef = React.useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  })

  React.useEffect(() => {
    const handler = (e) => {
      if (!callbackRef?.current) {
        return
      }

      callbackRef.current({
        x: window.scrollX,
        y: window.scrollY,
        e,
      })
    }
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])
}
