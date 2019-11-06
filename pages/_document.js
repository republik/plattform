import React from 'react'
import Document, { Head, Main, NextScript } from 'next/document'
import { renderStatic } from 'glamor/server'
import { fontFaces } from '@project-r/styleguide'

export default class MyDocument extends Document {
  static async getInitialProps({ renderPage }) {
    const page = renderPage()
    const styles = renderStatic(() => page.html)
    return {
      ...page,
      ...styles,
      env: require('../lib/settings')
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
    const {
      css,
      env: { PIWIK_URL_BASE, PIWIK_SITE_ID }
    } = this.props
    const piwik = !!PIWIK_URL_BASE && !!PIWIK_SITE_ID
    return (
      <html>
        <Head>
          <meta name='viewport' content='width=device-width,initial-scale=1' />
          <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
          <style
            dangerouslySetInnerHTML={{
              __html: fontFaces()
            }}
          />
          {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
          <meta name='author' content='Republik' />
        </Head>
        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: `var _paq = _paq || [];`
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
            })();`
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
      </html>
    )
  }
}
