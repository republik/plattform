import { AppProps } from 'next/app'
import Head from 'next/head'

import { PagePropsWithApollo } from '@republik/nextjs-apollo-client'
import { withApollo } from '../lib/apollo'

const WebApp = ({ Component, pageProps }: AppProps<PagePropsWithApollo>) => {
  const {
    // SSR only props
    providedUserAgent = undefined,
    serverContext = undefined,
    assumeAccess = false,
    ...otherPageProps
  } = pageProps

  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width,initial-scale=1' />
      </Head>
      <Component serverContext={serverContext} {...otherPageProps} />
    </>
  )
}

export default withApollo(WebApp)
