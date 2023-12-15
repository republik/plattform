'use client'

import { css } from '@app/styled-system/css'
import { IconArrowDownward, IconArrowUpward } from '@republik/icons'
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

  const pullToRefresh = useCallback(() => {
    refresh()
  }, [refresh])

  const indicatorState = usePullToRefresh(ref, pullToRefresh)

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
          color: 'var(--color-text-lighter)',
          transition: 'opacity 0.2s ease-in-out',
          zIndex: 10,
        })}
      >
        <IconArrowUpward
          size='3rem'
          className={css({
            transition: 'all 0.2s ease-out',
            transform: `translateY(calc(calc(var(--pull-to-refresh-progress, 0) * 30px) - 30px)) rotate(calc(var(--pull-to-refresh-progress, 0) * 360deg))`,
            opacity: `calc(var(--pull-to-refresh-progress, 0) * 100%)`,
          })}
        />
        {/* <span style={{ marginLeft: '8px' }}>Pull to refresh</span> */}
      </div>
      <div ref={ref} {...props}>
        {children}
      </div>
    </div>
  )
}
