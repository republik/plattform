import { createApolloClientUtilities } from '@republik/nextjs-apollo-client'

import { API_URL, API_WS_URL } from '../settings'

const isClient = typeof window !== 'undefined'

export const { initializeApollo, withApollo } = createApolloClientUtilities({
  name: '@orbiting/publikator-app',
  version: process.env.BUILD_ID,
  apiUrl: isClient ? '/graphql' : API_URL,
  wsUrl: API_WS_URL,
  headers: isClient
    ? {}
    : {
        'x-api-gateway-client': process.env.API_GATEWAY_CLIENT ?? 'publikator',
        'x-api-gateway-token': process.env.API_GATEWAY_TOKEN,
      },
})
