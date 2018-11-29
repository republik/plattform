import App, { Container } from 'next/app'
import React from 'react'
import { ApolloProvider } from 'react-apollo'

import { HeadersProvider } from '../lib/withHeaders'
import withApolloClient from '../lib/withApolloClient'

class WebApp extends App {
  render () {
    const { Component, pageProps, apolloClient, headers, serverContext } = this.props
    return <Container>
      <ApolloProvider client={apolloClient}>
        <HeadersProvider headers={headers}>
          <Component serverContext={serverContext} {...pageProps} />
        </HeadersProvider>
      </ApolloProvider>
    </Container>
  }
}

export default withApolloClient(WebApp)
