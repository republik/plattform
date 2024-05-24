import Document, { Head, Html, Main, NextScript } from 'next/document'

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
    const piwikbaseUrl = process.env.NEXT_PUBLIC_PIWIK_URL_BASE
    const piwikSiteId = process.env.NEXT_PUBLIC_PIWIK_SITE_ID
    const piwik = !!piwikbaseUrl && !!piwikSiteId

    return (
      <Html>
        <Head>
          <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
          {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
        </Head>
        <body>
          <Main />
          <NextScript />
          {piwik && (
            <script
              dangerouslySetInnerHTML={{
                __html: `
            var _paq = _paq || [];
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            (function() {
              _paq.push(['setTrackerUrl', '${piwikbaseUrl}/piwik.php']);
              _paq.push(['setSiteId', '${piwikSiteId}']);
              var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
              g.type='text/javascript'; g.async=true; g.defer=true; g.src='${piwikbaseUrl}/piwik.js'; s.parentNode.insertBefore(g,s);
            })();`,
              }}
            />
          )}
          {piwik && (
            <noscript>
              <img
                src={`${piwikbaseUrl}/piwik.php?idsite=${piwikSiteId}&rec=1`}
                style={{ border: 0 }}
                alt=''
              />
            </noscript>
          )}
        </body>
      </Html>
    )
  }
}
