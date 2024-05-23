import App from 'next/app'
import React from 'react'

import { withApollo } from '../lib/apollo'

class WebApp extends App {
  render() {
    const { Component, pageProps, url, serverContext } = this.props
    return <Component serverContext={serverContext} url={url} {...pageProps} />
  }
}

export default withApollo(WebApp)
