import * as React from 'react'
import Document, {
  Head,
  Main,
  NextScript
} from 'next/document'
import { renderStatic } from 'glamor/server'
import { fontFaces } from '@project-r/styleguide'

declare global {
  interface Window {
    __NEXT_DATA__: any
  }
}

export default class MyDocument extends Document {
  public static async getInitialProps({ renderPage }: any) {
    const page = renderPage()
    const styles = renderStatic(() => page.html)
    return {
      ...page,
      ...styles,
      env: require('../constants')
    }
  }

  constructor(props: any) {
    super(props)

    const { __NEXT_DATA__, env } = props
    if (env) {
      __NEXT_DATA__.env = this.props.env
    }
  }
  public render() {
    const { css } = this.props
    return (
      <html>
        <Head>
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1"
          />
          <meta
            httpEquiv="X-UA-Compatible"
            content="IE=edge"
          />
          <style
            dangerouslySetInnerHTML={{
              __html: fontFaces()
            }}
          />
          {css
            ? <style
                dangerouslySetInnerHTML={{ __html: css }}
              />
            : null}
          <meta name="author" content="Republik" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
