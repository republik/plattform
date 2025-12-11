// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
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
