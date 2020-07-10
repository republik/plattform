import App from 'next/app'
import React from 'react'
import { ApolloProvider } from 'react-apollo'

import { HeadersProvider } from '../lib/withHeaders'
import withApolloClient from '../lib/withApolloClient'

class WebApp extends App {
  render () {
    const { Component, pageProps, apolloClient, headers, serverContext } = this.props
    return <ApolloProvider client={apolloClient}>
      <HeadersProvider headers={headers}>
        <Component serverContext={serverContext} {...pageProps} />
      </HeadersProvider>
    </ApolloProvider>
  }
}

export default withApolloClient(WebApp)
