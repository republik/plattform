import App from 'next/app'
import React from 'react'
import PlausibleProvider from 'next-plausible'

import { withApollo } from '../lib/apollo'

function PlausibleWrapper({ children }) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

  if (!plausibleDomain) {
    return <>{children}</>
  }

  return (
    <PlausibleProvider domain={plausibleDomain}>{children}</PlausibleProvider>
  )
}

class WebApp extends App {
  render() {
    const { Component, pageProps, url, serverContext } = this.props
    return (
      <PlausibleWrapper>
        <Component serverContext={serverContext} url={url} {...pageProps} />
      </PlausibleWrapper>
    )
  }
}

export default withApollo(WebApp)
