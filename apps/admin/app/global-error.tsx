'use client'

import * as Sentry from '@sentry/nextjs'
import NextError from 'next/error'
import { useEffect } from 'react'
import { Body, Content } from '@/components/Layout'

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <Body>
      <Content id='content'>
        {/* `NextError` is the default Next.js error page component. Its type
           definition requires a `statusCode` prop. However, since the App Router
           does not expose status codes for errors, we simply pass 0 to render a
           generic error message. */}
        <NextError statusCode={0} />{' '}
      </Content>
    </Body>
  )
}
