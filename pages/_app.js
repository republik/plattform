import App from 'next/app'
import React from 'react'
import { ApolloProvider } from 'react-apollo'
import Head from 'next/head'

import withApolloClient from '../lib/apollo/withApolloClient'
import Track from '../components/Track'

import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/theme/neo.css'

class WebApp extends App {
  render() {
    const { Component, pageProps, apolloClient, serverContext } = this.props
    return (
      <ApolloProvider client={apolloClient}>
        <Head>
          <meta name='viewport' content='width=device-width,initial-scale=1' />
        </Head>
        <Component serverContext={serverContext} {...pageProps} />
        <Track />
      </ApolloProvider>
    )
  }
}

export default withApolloClient(WebApp)
