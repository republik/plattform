// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

if (process.env.NEXT_PUBLIC_SENTRY_DISABLED !== 'true') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    ignoreErrors: ['<unknown>'],
  })
}

// This export will instrument router navigations, and is only relevant if you enable tracing.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
