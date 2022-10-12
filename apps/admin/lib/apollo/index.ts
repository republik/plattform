import getConfig from 'next/config'
import {
  createApolloClientUtilities,
  makeWithDefaultSSR,
} from '@republik/nextjs-apollo-client'
import { API_URL } from '../../server/constants'

const { publicRuntimeConfig } = getConfig()

export const { withApollo, initializeApollo } = createApolloClientUtilities({
  name: '@orbiting/admin-app',
  version: publicRuntimeConfig.buildId,
  apiUrl: API_URL,
})

export const withDefaultSSR = makeWithDefaultSSR(initializeApollo)
