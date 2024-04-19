import * as Sentry from '@sentry/nextjs'

export const reportError = async (context: string, error: Error | string) => {
  Sentry.captureException(error, {
    tags: {
      origin: 'reportError-func',
      reportErrorContext: context,
    },
  })
}
