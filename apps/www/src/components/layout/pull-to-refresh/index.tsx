'use client'

import { css } from '@app/styled-system/css'
import { IconArrowDownward } from '@republik/icons'
import throttle from 'lodash/throttle'
import { useRouter } from 'next/navigation'
import React, { useCallback, useRef } from 'react'
import { IndicatorState, usePullToRefresh } from './usePullToRefresh'

type PullToRefreshProps = {
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>

export function PullToRefresh({ children, ...props }: PullToRefreshProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { refresh } = useRouter()

  const pullToRefresh = useCallback(
    throttle(() => {
      console.log('Pull to refresh')
    }, 1000),
    [refresh],
  )

  const indicatorState = usePullToRefresh(ref, pullToRefresh)

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
            indicatorState == IndicatorState.LOADING
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
              indicatorState >= IndicatorState.TRIGGERED
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
