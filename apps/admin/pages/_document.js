import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { renderStatic } from 'glamor/server'
import { fontFaces } from '@project-r/styleguide'

export default class MyDocument extends Document {
  static async getInitialProps({ renderPage }) {
    const page = renderPage()
    const styles = renderStatic(() => page.html)
    return {
      ...page,
      ...styles,
      env: require('../server/constants'),
    }
  }

  constructor(props) {
    super(props)

    const { __NEXT_DATA__, env } = props
    if (env) {
      __NEXT_DATA__.env = this.props.env
    }
  }
  render() {
    const { css } = this.props
    return (
      <Html>
        <Head>
          <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
          <style
            dangerouslySetInnerHTML={{
              __html: fontFaces(),
            }}
          />
          {css ? (
            <style
              dangerouslySetInnerHTML={{
                __html: css,
              }}
            />
          ) : null}
          <meta name='author' content='Republik' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
