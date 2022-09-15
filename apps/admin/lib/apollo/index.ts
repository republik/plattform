import {
  createApolloClientUtilities,
  makeWithDefaultSSR,
} from '@republik/nextjs-apollo-client'
import { API_URL } from '../../server/constants'

export const { withApollo, initializeApollo } = createApolloClientUtilities({
  name: '@orbiting/admin-app',
  version: '1.0',
  apiUrl: API_URL,
})

export const withDefaultSSR = makeWithDefaultSSR(initializeApollo)
