import { AppProps } from 'next/app'
import Head from 'next/head'
import { RootColorVariables } from '@project-r/styleguide'

import { PagePropsWithApollo } from '@republik/nextjs-apollo-client'
import { withApollo } from '../lib/apollo'
import PlausibleProvider from 'next-plausible'

function PlausibleWrapper({ children }: { children: React.ReactNode }) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

  if (!plausibleDomain) {
    return <>{children}</>
  }

  return (
    <PlausibleProvider domain={plausibleDomain}>{children}</PlausibleProvider>
  )
}

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
      <PlausibleWrapper>
        <Component serverContext={serverContext} {...otherPageProps} />
      </PlausibleWrapper>
    </>
  )
}

export default withApollo(WebApp)
