// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const isProduction = process.env.NODE_ENV === 'production'

Sentry.init({
  dsn: 'https://ba8ba4ea6d7f9ad150547a6a15ac51f2@o4507101684105216.ingest.de.sentry.io/4507101768908880',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: isProduction ? 0.25 : 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})
