// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const isDev = process.env.NODE_ENV === 'development'
const sentryDisabled = process.env.SENTRY_DISABLED === 'true'

Sentry.init({
  dsn: 'https://59222d7d8b93d1c0324ea380eeab9233@o4507101684105216.ingest.de.sentry.io/4507101797220432',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  enabled: !sentryDisabled && !isDev,
})
