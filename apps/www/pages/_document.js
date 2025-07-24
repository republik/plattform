import { renderStaticOptimized } from 'glamor/server'
import Document, { Head, Html, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  static async getInitialProps({ renderPage, pathname, query, req, res }) {
    const page = await renderPage()
    const styles = renderStaticOptimized(() => page.html)

    return {
      ...page,
      ...styles,
      env: require('../lib/constants'),
    }
  }

  render() {
    const {
      css,
      env: { PUBLIC_BASE_URL },
    } = this.props
    return (
      <Html lang='de'>
        <Head>
          <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
          {css ? (
            <style data-glamor-ssr dangerouslySetInnerHTML={{ __html: css }} />
          ) : null}
          <meta name='author' content='Republik' />
          <link
            rel='apple-touch-icon'
            sizes='180x180'
            href={`${PUBLIC_BASE_URL}/static/apple-touch-icon.png`}
          />
          <link
            rel='icon'
            type='image/svg+xml'
            href={`${PUBLIC_BASE_URL}/static/favicon.svg`}
          />
          <link
            rel='icon'
            type='image/png'
            href={`${PUBLIC_BASE_URL}/static/favicon-32x32.png`}
            sizes='32x32'
          />
          <link
            rel='icon'
            type='image/png'
            href={`${PUBLIC_BASE_URL}/static/favicon-16x16.png`}
            sizes='16x16'
          />
          <link
            rel='manifest'
            href={`${PUBLIC_BASE_URL}/static/manifest.json`}
          />
          <link
            rel='mask-icon'
            href={`${PUBLIC_BASE_URL}/static/safari-pinned-tab.svg`}
            color='#000000'
          />
          <link
            rel='alternate icon'
            sizes='16x16'
            href={`${PUBLIC_BASE_URL}/static/favicon.ico`}
          />

          {/* browserconfig.xml can contain other static references, we skip cdnifing it */}
          <meta
            name='msapplication-config'
            content='/static/browserconfig.xml'
          />
          <meta name='referrer' content='no-referrer' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
