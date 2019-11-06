import App from 'next/app'
import React from 'react'
import { ApolloProvider } from 'react-apollo'

import withApolloClient from '../lib/apollo/withApolloClient'
import Track from '../components/Track'

class WebApp extends App {
  render() {
    const { Component, pageProps, apolloClient, serverContext } = this.props
    return (
      <ApolloProvider client={apolloClient}>
        <Component serverContext={serverContext} {...pageProps} />
        <Track />
      </ApolloProvider>
    )
  }
}

export default withApolloClient(WebApp)
