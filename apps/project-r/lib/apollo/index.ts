import { createApolloClientUtilities } from '@republik/nextjs-apollo-client'
import { API_BASE_URL } from '../publicEnv'

export const { initializeApollo, withApollo } = createApolloClientUtilities({
  name: '@prject-r/construction',
  version: process.env.BUILD_ID,
  apiUrl: API_BASE_URL!,
})
