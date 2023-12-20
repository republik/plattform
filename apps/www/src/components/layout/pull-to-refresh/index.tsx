'use client'

import { css } from '@app/styled-system/css'
import { IconRefresh } from '@republik/icons'
import { useRouter } from 'next/navigation'
import React, { useCallback, useRef } from 'react'
import { usePullToRefresh } from './usePullToRefresh'

type PullToRefreshProps = {
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>

export function PullToRefresh({ children, ...props }: PullToRefreshProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { refresh } = useRouter()

  const pullToRefresh = useCallback(() => {
    refresh()
    console.log('refresh')
  }, [refresh])

  usePullToRefresh(ref, pullToRefresh)

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
