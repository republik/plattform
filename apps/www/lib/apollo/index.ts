import createApolloClientUtilities from '@republik/nextjs-apollo-client'
import {
  inNativeAppBrowser,
  inNativeAppBrowserLegacy,
} from '../withInNativeApp'
import { createAppWorkerLink } from './appWorkerLink'

export default createApolloClientUtilities({
  apiUrl: process.env.API_URL,
  wsUrl: process.env.API_WS_URL,
  mobileConfigOptions: {
    isInMobileApp: inNativeAppBrowser && inNativeAppBrowserLegacy,
    createAppWorkerLink,
  },
})
