'use client'
import { PropsWithChildren } from 'react'
import { API_URL } from '@/server/constants'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'

const isClient = typeof window !== 'undefined'

const client = new ApolloClient({
  name: '@orbiting/admin-app',
  version: process.env.BUILD_ID,
  uri: isClient ? '/graphql' : API_URL,
  cache: new InMemoryCache(),
  headers: isClient
    ? {}
    : {
        'x-api-gateway-client': process.env.API_GATEWAY_CLIENT ?? 'admin',
        'x-api-gateway-token': process.env.API_GATEWAY_TOKEN,
      },
})

export function GraphqlProvider({ children }: PropsWithChildren) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
