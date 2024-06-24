import Document, { Html, Head, Main, NextScript } from 'next/document'
import { renderStatic } from 'glamor/server'
export default class MyDocument extends Document {
  static async getInitialProps({ renderPage }) {
    const page = await renderPage()
    const styles = renderStatic(() => page.html)
    return {
      ...page,
      ...styles,
    }
  }

  render() {
    const { css } = this.props
    return (
      <Html>
        <Head>
          <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
          {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
          <meta name='author' content='Republik' />
        </Head>
        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: `var _paq = _paq || [];`,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
