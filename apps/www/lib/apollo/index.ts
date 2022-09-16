import getConfig from 'next/config'
import { createApolloClientUtilities } from '@republik/nextjs-apollo-client'
import { API_URL, API_WS_URL } from '../constants'
import {
  inNativeAppBrowser,
  inNativeAppBrowserLegacy,
} from '../withInNativeApp'
import { createAppWorkerLink } from './appWorkerLink'

const { publicRuntimeConfig } = getConfig()

console.log('apollo', publicRuntimeConfig, process.env.buildId)

export const { initializeApollo, withApollo } = createApolloClientUtilities({
  name: '@orbiting/www-app',
  version: publicRuntimeConfig.buildId,
  apiUrl: API_URL,
  wsUrl: API_WS_URL,
  mobileConfigOptions: {
    isInMobileApp: inNativeAppBrowser && inNativeAppBrowserLegacy,
    createAppWorkerLink,
  },
})
