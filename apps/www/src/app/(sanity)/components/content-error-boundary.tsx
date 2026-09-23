'use client'

import { Button } from '@/app/components/ui/button'
import { css } from '@republik/theme/css'
import * as Sentry from '@sentry/nextjs'
import { catchError, type ErrorInfo } from 'next/error'
import { useEffect } from 'react'

function ErrorFallback(
  { title, location }: { title: string; location?: string },
  { error, retry }: ErrorInfo,
) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        context: 'ContentErrorBoundary',
        location,
      },
    })
  }, [error])
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4',
        color: 'textSoft',
        textStyle: 'sans',
        py: '4',
      })}
    >
      <h2>{title}</h2>
      <Button variant='outline' size='small' onClick={() => retry()}>
        Neu laden
      </Button>
    </div>
  )
}

export const ContentErrorBoundary = catchError(ErrorFallback)
