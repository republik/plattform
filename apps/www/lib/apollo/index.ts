import { createApolloClientUtilities } from '@republik/nextjs-apollo-client'
import { API_URL, API_WS_URL } from '../constants'
import {
  inNativeAppBrowser,
  inNativeAppBrowserLegacy,
} from '../withInNativeApp'
import { createAppWorkerLink } from './appWorkerLink'

export const { initializeApollo, withApollo } = createApolloClientUtilities({
  name: '@orbiting/www-app',
  version: process.env.BUILD_ID,
  apiUrl: API_URL,
  wsUrl: API_WS_URL,
  mobileConfigOptions: {
    isInMobileApp: inNativeAppBrowser && inNativeAppBrowserLegacy,
    createAppWorkerLink,
  },
  headers: process.env.NEXT_PUBLIC_API_AUTHORIZATION_TOKEN
    ? {
        authorization: `Bearer ${process.env.NEXT_PUBLIC_API_AUTHORIZATION_TOKEN}`,
      }
    : {},
})
