import { createApolloClientUtilities } from '@republik/nextjs-apollo-client'
import { API_URL, API_WS_URL, isClient } from '../constants'
import {
  inNativeAppBrowser,
  inNativeAppBrowserLegacy,
} from '../withInNativeApp'
import { createAppWorkerLink } from './appWorkerLink'

export const { initializeApollo, withApollo } = createApolloClientUtilities({
  name: '@orbiting/www-app',
  version: process.env.BUILD_ID,
  apiUrl: isClient ? '/graphql' : API_URL,
  wsUrl: API_WS_URL,
  headers: isClient
    ? {}
    : {
        'x-api-gateway-client': process.env.API_GATEWAY_CLIENT ?? 'www',
        'x-api-gateway-token': process.env.API_GATEWAY_TOKEN,
      },
  mobileConfigOptions: {
    isInMobileApp: inNativeAppBrowser && inNativeAppBrowserLegacy,
    createAppWorkerLink,
  },
})
