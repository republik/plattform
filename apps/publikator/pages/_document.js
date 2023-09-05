import Document, { Html, Head, Main, NextScript } from 'next/document'
import { renderStatic } from 'glamor/server'
import { fontFaces } from '@project-r/styleguide'

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
    const PIWIK_URL_BASE = process.env.NEXT_PUBLIC_PIWIK_URL_BASE
    const PIWIK_SITE_ID = process.env.NEXT_PUBLIC_PIWIK_SITE_ID
    const piwik = !!PIWIK_URL_BASE && !!PIWIK_SITE_ID
    return (
      <Html>
        <Head>
          <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
          <style
            dangerouslySetInnerHTML={{
              __html: fontFaces(),
            }}
          />
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
          {piwik && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
            _paq.push(['enableLinkTracking']);
            (function() {
              _paq.push(['setTrackerUrl', '${PIWIK_URL_BASE}/piwik.php']);
              _paq.push(['setSiteId', '${PIWIK_SITE_ID}']);
              var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
              g.type='text/javascript'; g.async=true; g.defer=true; g.src='${PIWIK_URL_BASE}/piwik.js'; s.parentNode.insertBefore(g,s);
            })();`,
              }}
            />
          )}
          {piwik && (
            <noscript>
              <img
                src={`${PIWIK_URL_BASE}/piwik.php?idsite=${PIWIK_SITE_ID}&rec=1`}
                style={{ border: 0, position: 'fixed', left: -1 }}
                alt=''
              />
            </noscript>
          )}
        </body>
      </Html>
    )
  }
}
