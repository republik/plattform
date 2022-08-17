import { createApolloClientUtilities } from '@republik/nextjs-apollo-client'

import { API_URL, API_WS_URL } from '../settings'

export const { initializeApollo, withApollo } = createApolloClientUtilities({
  apiUrl: API_URL,
  wsUrl: API_WS_URL,
})
