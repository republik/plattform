import { ApolloLink, HttpLink } from '@apollo/client'
import { WebSocketLink } from '@apollo/client/link/ws'

import { API_URL, API_WS_URL, API_AUTHORIZATION_HEADER } from '../constants'
import {
  inNativeAppBrowser,
  inNativeAppBrowserLegacy,
} from '../withInNativeApp'
import { createAppWorkerLink, hasSubscriptionOperation } from './appWorkerLink'

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

const __DEV__ = process.env.NODE_ENV === 'development'

const rewriteAPIHost = (url) => {
  if (__DEV__) {
    // support Android Emulator and Virtualbox IE VM
    if (
      process.browser &&
      url.indexOf('localhost') !== -1 &&
      location.hostname !== 'localhost'
    ) {
      return url.replace('localhost', location.hostname)
    }
  }
  return url
}

export const createLink = (headers = {}, onResponse = () => {}) => {
  if (inNativeAppBrowser && inNativeAppBrowserLegacy) {
    return createAppWorkerLink()
  }
  const http = new HttpLink({
    uri: rewriteAPIHost(API_URL),
    credentials: 'include',
    headers: {
      cookie: headers.cookie,
      accept: headers.accept,
      Authorization: headers.authorization || API_AUTHORIZATION_HEADER,
    },
  })

  if (process.browser) {
    return ApolloLink.split(
      hasSubscriptionOperation,
      new WebSocketLink({
        uri: rewriteAPIHost(API_WS_URL),
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
