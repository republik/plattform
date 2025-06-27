// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

if (process.env.NEXT_PUBLIC_SENTRY_DISABLED !== 'true') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    ignoreErrors: [
      'Script error.',
      'Error: aborted',
      /Failed to load/i,
      /Failed to fetch/i,
      /Load failed/i,
      /fetch failed/i,
      /NetworkError when attempting to fetch resource/i,
      /Invariant: attempted to hard navigate to the same URL/i,
      /Sie müssen sich zuerst anmelden/i,
    ],
    denyUrls: [/https?:\/\/datawrapper\.dwcdn\.net\//],
    integrations: [
      // Include GraphQL queries in error spans
      Sentry.graphqlClientIntegration({
        endpoints: [process.env.NEXT_PUBLIC_API_URL],
      }),
    ],
  })
}

// This export will instrument router navigations, and is only relevant if you enable tracing.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
