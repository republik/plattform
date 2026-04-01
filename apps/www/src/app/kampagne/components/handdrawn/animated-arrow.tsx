'use client'

import { css } from '@republik/theme/css'
import { ReactNode } from 'react'

const arrowBodyMaskStyle = css({
  strokeDasharray: 300,
  strokeDashoffset: 300,
  strokeLinecap: 'round',
  animation: 'campaign26ArrowLoops 0.7s ease-out 0.1s forwards',
})

const arrowTipMaskStyle = css({
  strokeDasharray: 80,
  strokeDashoffset: 80,
  strokeLinecap: 'round',
  animation: 'campaign26ArrowTip 0.2s ease-out 0.8s forwards',
})

type AnimatedArrowProps = {
  children: ReactNode
  showArrow?: boolean
  size: 'xs' | 'sm' | 'md'
}

const styles = {
  xs: {
    right: 33,
    bottom: -30,
    width: 66,
  },
  sm: {
    right: 20,
    bottom: -39,
    width: 90,
  },
  md: {
    right: 9,
    bottom: -44,
  },
}

export function AnimatedArrow({
  children,
  showArrow,
  size = 'md',
}: AnimatedArrowProps) {
  if (!showArrow) return <>{children}</>

  return (
    <span
      className={css({
        display: 'inline-block',
        position: 'relative',
        overflow: 'visible',
      })}
    >
      <svg
        width='109.52'
        height='77.14'
        viewBox='0 0 109.52 77.14'
        xmlns='http://www.w3.org/2000/svg'
        style={{
          position: 'absolute',
          zIndex: 10,
          ...styles[size],
        }}
      >
        <path
          d='M9.09,18.38c.29,7.6,5.78,14.82,14.12,12.63,6.12-1.41,14.32-9.06,14.77-14.59.2-1.85-1.25-3.01-3.07-2.52-1.99.47-3.77,1.83-5.36,3.46-4.34,4.4-7.11,11.88-4.22,17.73,3.99,7.93,13.79,5.25,20.59,2.1,8.28-3.91,17.23-9.65,21.92-17.56,3.13-5.6.26-8.47-4.95-6.08-4.5,2.07-8.15,6.04-11,10.08-4.04,5.59-6.91,13.27-5.35,20.56.88,4.7,3.59,9.46,8.11,11.31,11.19,4.46,29.85-8.41,38.51-14.66'
          strokeWidth='3.55'
          stroke='#60031e'
          fill='none'
          className={arrowBodyMaskStyle}
        />
        <path
          d='M72.32,40.18s5.25,3.2,20.54-1.04c8.01-2.23-9.05,16.22-10.27,22.41'
          strokeWidth='3.27'
          strokeLinejoin='round'
          strokeMiterlimit='10'
          stroke='#60031e'
          fill='none'
          className={arrowTipMaskStyle}
        />
      </svg>
      {children}
    </span>
  )
}
