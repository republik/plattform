import * as Sentry from '@sentry/nextjs'

export async function reportError(
  context: string,
  error: Error | string,
): Promise<string> {
  return Sentry.captureException(error, {
    tags: {
      origin: 'reportError-func',
      reportErrorContext: context,
    },
  })
}
