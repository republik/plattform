import {
  createApolloClientUtilities,
  makeWithDefaultSSR,
} from '@republik/nextjs-apollo-client'
import { API_URL } from '../../server/constants'
import { SentryErrorLink } from 'lib/sentry/apollo-error-link'

export const { withApollo, initializeApollo } = createApolloClientUtilities({
  name: '@orbiting/admin-app',
  version: process.env.BUILD_ID,
  apiUrl: API_URL,
  errorLink: SentryErrorLink,
})

export const withDefaultSSR = makeWithDefaultSSR(initializeApollo)
