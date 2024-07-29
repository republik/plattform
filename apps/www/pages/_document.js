import { Children } from 'react'
import Document, {
  Html,
  Head as DefaultHead,
  Main,
  NextScript,
} from 'next/document'
import { renderStaticOptimized } from 'glamor/server'

// filter our preload links (js files)
// see https://github.com/zeit/next.js/issues/5054
class NoJsHead extends DefaultHead {
  render() {
    const res = super.render()

    function transform(node) {
      // remove next fouc prevention
      if (node && node.props && node.props['data-next-hide-fouc']) {
        return null
      }
      // remove all link preloads
      if (
        node &&
        node.type === 'link' &&
        node.props &&
        node.props.rel === 'preload'
      ) {
        return null
      }
      if (node && node.props && node.props.children) {
        return {
          ...node,
          props: {
            ...node.props,
            children: Children.map(node.props.children, transform),
          },
        }
      }
      if (Array.isArray(node)) {
        return node.map(transform)
      }

      return node
    }

    return transform(res)
  }
}

export default class MyDocument extends Document {
  static async getInitialProps({ renderPage, pathname, query, req, res }) {
    const page = await renderPage()
    const styles = renderStaticOptimized(() => page.html)
    const nojs = pathname === '/' && !!query.extractId

    if (nojs) {
      res.setHeader('Cache-Control', 'max-age=3600, immutable')
    }

    return {
      ...page,
      ...styles,
      env: require('../lib/constants'),
      nojs,
    }
  }

  render() {
    const {
      css,
      env: { PUBLIC_BASE_URL },
      nojs,
    } = this.props
    const Head = nojs ? NoJsHead : DefaultHead
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
          {!nojs && (
            <script
              dangerouslySetInnerHTML={{ __html: `var _paq = _paq || [];` }}
            />
          )}
          <Main />
          {!nojs && <NextScript />}
        </body>
      </Html>
    )
  }
}
