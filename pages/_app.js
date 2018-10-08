import App, { Container } from 'next/app'
import React from 'react'
import { ApolloProvider } from 'react-apollo'

import withApolloClient from '../lib/apollo/withApolloClient'
import Track from '../components/Track'

class WebApp extends App {
  render () {
    const { Component, pageProps, apolloClient, serverContext } = this.props
    return <Container>
      <ApolloProvider client={apolloClient}>
        <Component serverContext={serverContext} {...pageProps} />
        <Track />
      </ApolloProvider>
    </Container>
  }
}

export default withApolloClient(WebApp)
