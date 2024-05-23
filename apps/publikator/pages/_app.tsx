import { AppProps } from 'next/app'
import Head from 'next/head'
import { withApollo } from '../lib/apollo'
import { RootColorVariables } from '@project-r/styleguide'
import PlausibleProvider from 'next-plausible'

import Track from '../components/Track'

import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/theme/neo.css'

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
  serverContext: any
}

const WebApp = ({ Component, pageProps }: AppProps<WebAppProps>) => {
  const { serverContext, ...otherPageProps } = pageProps
  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width,initial-scale=1' />
      </Head>
      <RootColorVariables />
      <PlausibleWrapper>
        <Component serverContext={serverContext} {...otherPageProps} />
      </PlausibleWrapper>
      <Track />
    </>
  )
}

export default withApollo(WebApp)
