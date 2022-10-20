import { AppProps } from 'next/app'
import Head from 'next/head'
import { withApollo } from '../lib/apollo'

import Track from '../components/Track'

import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/theme/neo.css'

type Props = {
  serverContext: any
}

const WebApp = ({ Component, pageProps }: AppProps<Props>) => {
  const { serverContext, ...remainingProps } = pageProps
  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width,initial-scale=1' />
      </Head>
      <Component serverContext={serverContext} {...remainingProps} />
      <Track />
    </>
  )
}

export default withApollo(WebApp)
