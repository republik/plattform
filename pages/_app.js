import App, { Container } from 'next/app'
import React from 'react'
import { compose } from 'redux'

import { ApolloProvider } from 'react-apollo'
import withData from '../lib/apollo/withData'

class MyApp extends App {
  render () {
    const {
      Component,
      pageProps,
      apolloClient
    } = this.props
    return (
      <Container>
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
        </ApolloProvider>
      </Container>
    )
  }
}

export default compose(withData)(MyApp)
