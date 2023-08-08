import { AppProps } from 'next/app'
import Head from 'next/head'
import { withApollo } from '../lib/apollo'
import { RootColorVariables } from '@project-r/styleguide'

import Track from '../components/Track'

import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/theme/neo.css'

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
      <Component serverContext={serverContext} {...otherPageProps} />
      <Track />
    </>
  )
}

export default withApollo(WebApp)
