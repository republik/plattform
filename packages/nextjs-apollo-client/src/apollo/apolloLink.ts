import { ApolloLink, HttpLink } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'

import { ApolloClientOptions } from './apolloClient'
import { isClient, isDev } from './utils'

export const hasSubscriptionOperation = ({ query: { definitions } }) =>
  definitions.some(
    ({ kind, operation }) =>
      kind === 'OperationDefinition' && operation === 'subscription',
  )

const withResponseInterceptor = ({ onResponse }) =>
  new ApolloLink((operation, forward) => {
    return forward(operation).map((result) => {
      const context = operation.getContext()
      if (context.response) {
        onResponse(context.response)
      }
      return result
    })
  })

const rewriteAPIHost = (url) => {
  if (isDev) {
    // support Android Emulator and Virtualbox IE VM
    if (
      isClient &&
      url.indexOf('localhost') !== -1 &&
      location.hostname !== 'localhost'
    ) {
      return url.replace('localhost', location.hostname)
    }
  }
  return url
}

type CreateLinkOptions = ApolloClientOptions

export const createLink = ({
  apiUrl,
  wsUrl,
  headers = {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onResponse = () => {},
  mobileConfigOptions,
}: CreateLinkOptions) => {
  if (mobileConfigOptions && mobileConfigOptions.isInMobileApp) {
    return mobileConfigOptions.createAppWorkerLink()
  }
  const http = new HttpLink({
    uri: rewriteAPIHost(apiUrl),
    credentials: 'include',
    headers: headers as Record<string, string>,
  })

  if (isClient && wsUrl) {
    return ApolloLink.split(
      hasSubscriptionOperation,
      new GraphQLWsLink(
        createClient({
          url: rewriteAPIHost(wsUrl),
          lazy: true,
          retryAttempts: 5,
          shouldRetry: () => true,
          connectionParams: () => ({
            // Auth params if needed
          }),
        }),
      ),
      http,
    )
  }
  // Link used for SSR
  return ApolloLink.from([
    withResponseInterceptor({
      onResponse,
    }),
    http,
  ])
}
