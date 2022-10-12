import getConfig from 'next/config'
import { createApolloClientUtilities } from '@republik/nextjs-apollo-client'

import { API_URL, API_WS_URL } from '../settings'

const { publicRuntimeConfig } = getConfig()

export const { initializeApollo, withApollo } = createApolloClientUtilities({
  name: '@orbiting/publikator-app',
  version: publicRuntimeConfig.buildId,
  apiUrl: API_URL,
  wsUrl: API_WS_URL,
})
