import { ApolloClient, InMemoryCache } from '@apollo/client'
import { headers } from 'next/headers'
import { API_URL } from 'server/constants'

export async function getClient() {
  const requestHeaders = await headers()

  const client = new ApolloClient({
    name: '@orbiting/admin-app',
    version: process.env.BUILD_ID,
    uri: API_URL,
    cache: new InMemoryCache(),
    headers: {
      cookie: requestHeaders.get('cookie') ?? '',
      'x-api-gateway-client': process.env.API_GATEWAY_CLIENT ?? 'admin',
      'x-api-gateway-token': process.env.API_GATEWAY_TOKEN,
    },
  })

  return client
}
