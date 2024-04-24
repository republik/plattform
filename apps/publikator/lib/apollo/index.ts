import { createApolloClientUtilities } from '@republik/nextjs-apollo-client'

import { API_URL, API_WS_URL } from '../settings'
import { SentryErrorLink } from 'lib/sentry/apollo-error-link'

export const { initializeApollo, withApollo } = createApolloClientUtilities({
  name: '@orbiting/publikator-app',
  version: process.env.BUILD_ID,
  apiUrl: API_URL,
  wsUrl: API_WS_URL,
  errorLink: SentryErrorLink,
})
