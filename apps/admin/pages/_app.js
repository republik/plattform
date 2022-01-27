import App from 'next/app'
import React from 'react'
import { ApolloProvider } from 'react-apollo'
import Head from 'next/head'

import { HeadersProvider } from '../lib/withHeaders'
import withApolloClient from '../lib/withApolloClient'

class WebApp extends App {
  render () {
    const { Component, pageProps, apolloClient, headers, serverContext } = this.props
    return <ApolloProvider client={apolloClient}>
      <HeadersProvider headers={headers}>
        <Head>
          <meta name='viewport' content='width=device-width,initial-scale=1' />
        </Head>
        <Component serverContext={serverContext} {...pageProps} />
      </HeadersProvider>
    </ApolloProvider>
  }
}

export default withApolloClient(WebApp)
