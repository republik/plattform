import { AppProps } from 'next/app'
import Head from 'next/head'
import { RootColorVariables } from '@project-r/styleguide'

import { PagePropsWithApollo } from '@republik/nextjs-apollo-client'
import { withApollo } from '../lib/apollo'

type WebAppProps = {
  serverContext?: any
}

const WebApp = ({
  Component,
  pageProps,
}: AppProps<PagePropsWithApollo<WebAppProps>>) => {
  const {
    // SSR only props
    serverContext = undefined,
    ...otherPageProps
  } = pageProps

  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width,initial-scale=1' />
      </Head>
      <RootColorVariables />
      <Component serverContext={serverContext} {...otherPageProps} />
    </>
  )
}

export default withApollo(WebApp)
