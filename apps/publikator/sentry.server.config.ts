// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const isDev = process.env.NODE_ENV === 'development'
const sentryDisabled = process.env.SENTRY_DISABLED === 'true'

Sentry.init({
  dsn: 'https://4956258fce61d6251af696e52a581707@o4507101684105216.ingest.de.sentry.io/4507102032691280',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  enabled: !sentryDisabled && !isDev,
})
