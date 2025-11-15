import { createApolloClientUtilities } from '@republik/nextjs-apollo-client'
import { API_URL, API_WS_URL } from '../constants'

export const { initializeApollo, withApollo } = createApolloClientUtilities({
  name: '@orbiting/www-app',
  version: process.env.BUILD_ID,
  apiUrl: typeof window === 'undefined' ? API_URL : '/graphql',
  wsUrl: API_WS_URL,
})
