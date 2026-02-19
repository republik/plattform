import {
  createApolloClientUtilities,
  makeWithDefaultSSR,
} from '@republik/nextjs-apollo-client'
import { API_URL } from '../../server/constants'

const isClient = typeof window !== 'undefined'

export const { withApollo, initializeApollo } = createApolloClientUtilities({
  name: '@orbiting/admin-app',
  version: process.env.BUILD_ID,
  apiUrl: isClient ? '/graphql' : API_URL,
  headers: isClient
    ? {}
    : {
        'x-api-gateway-client': process.env.API_GATEWAY_CLIENT ?? 'admin',
        'x-api-gateway-token': process.env.API_GATEWAY_TOKEN,
      },
})

export const withDefaultSSR = makeWithDefaultSSR(initializeApollo)
