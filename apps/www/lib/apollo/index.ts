import { createApolloClientUtilities } from '@republik/nextjs-apollo-client'
import { API_URL, API_WS_URL } from '../constants'
import {
  inNativeAppBrowser,
  inNativeAppBrowserLegacy,
} from '../withInNativeApp'
import { createAppWorkerLink } from './appWorkerLink'
import { SentryErrorLink } from 'lib/sentry/apollo-error-link'

export const { initializeApollo, withApollo } = createApolloClientUtilities({
  name: '@orbiting/www-app',
  version: process.env.BUILD_ID,
  apiUrl: API_URL,
  wsUrl: API_WS_URL,
  mobileConfigOptions: {
    isInMobileApp: inNativeAppBrowser && inNativeAppBrowserLegacy,
    createAppWorkerLink,
  },
  errorLink: SentryErrorLink,
})
