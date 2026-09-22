'use client'

import { Button } from '@/app/components/ui/button'
import { css } from '@republik/theme/css'
import { catchError, type ErrorInfo } from 'next/error'

function ErrorFallback(props: { title: string }, { error, retry }: ErrorInfo) {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4',
        color: 'textSoft',
        textStyle: 'sans',
      })}
    >
      <h2>{props.title}</h2>
      <Button variant='outline' size='small' onClick={() => retry()}>
        Neu laden
      </Button>
    </div>
  )
}

export const ContentErrorBoundary = catchError(ErrorFallback)
