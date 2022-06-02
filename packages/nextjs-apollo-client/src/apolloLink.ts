import { ApolloLink, HttpLink } from '@apollo/client'
import { WebSocketLink } from '@apollo/client/link/ws'

import { ApolloClientOptions } from './apolloClient'
import { createAppWorkerLink, hasSubscriptionOperation } from './appWorkerLink'
import { isClient, isDev } from './util'

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
  headers,
  onResponse,
  isInMobileApp,
}: CreateLinkOptions) => {
  if (isInMobileApp) {
    return createAppWorkerLink()
  }
  const http = new HttpLink({
    uri: rewriteAPIHost(apiUrl),
    credentials: 'include',
    headers: {
      cookie: headers.cookie,
      accept: headers.accept,
      Authorization: headers.authorization,
    },
  })

  if (isClient) {
    return ApolloLink.split(
      hasSubscriptionOperation,
      new WebSocketLink({
        uri: rewriteAPIHost(wsUrl),
        options: {
          lazy: true,
          reconnect: true,
          timeout: 50000,
        },
      }),
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
