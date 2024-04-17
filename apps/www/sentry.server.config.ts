// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const isProduction = process.env.NODE_ENV === 'production'

Sentry.init({
  dsn: 'https://d5839f83efbf888e1f8108a48fecc287@o4505721260212224.ingest.sentry.io/4506817347977216',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: isProduction ? 0.25 : 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})
