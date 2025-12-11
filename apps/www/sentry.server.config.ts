// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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
      /fetch failed/i,
      /Load failed/i,
      /NetworkError when attempting to fetch resource/i,
      /Sie müssen sich zuerst anmelden/i,
      /__firefox__/i,
    ],

    integrations: [Sentry.extraErrorDataIntegration({ depth: 5 })],
  })
}
