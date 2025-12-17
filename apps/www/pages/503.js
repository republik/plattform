import { css } from 'glamor'
import Head from 'next/head'
import { withRouter } from 'next/router'

import {
  NarrowContainer,
  Logo,
  mediaQueries,
  fontStyles,
} from '@project-r/styleguide'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'
import { withDefaultSSR } from '../lib/apollo/helpers'

const styles = {
  container: css({
    backgroundColor: '#E9A733',
    color: '#fff',
    minHeight: '100vh',
  }),
  logoContainer: css({
    textAlign: 'center',
    paddingTop: 25,
    width: 200,
    marginLeft: 'auto',
    marginRight: 'auto',
    [mediaQueries.mUp]: {
      width: 280,
      paddingTop: 60 * 2,
    },
  }),
  whiteOnBlack: css({
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'antialiased',
    '& ::selection': {
      color: '#000',
      backgroundColor: '#fff',
    },
  }),
  message: css({
    color: '#fff',
    textAlign: 'center',
    ...fontStyles.sansSerifRegular21,
    padding: 10,
    marginTop: 40,
    '& a': {
      color: '#fff',
    },
  }),
}

const Page = ({ router }) => {
  const meta = {
    title: 'Republik',
    description: 'Bald wieder verfügbar.',
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
    url: `${PUBLIC_BASE_URL}${router.pathname}`,
  }

  return (
    <div {...styles.container}>
      <Head>
        <title>Republik</title>
        <meta name='description' content={meta.description} />
        <meta property='og:type' content='website' />
        <meta property='og:url' content={meta.url} />
        <meta property='og:title' content={meta.title} />
        <meta property='og:description' content={meta.description} />
        <meta property='og:image' content={meta.image} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@RepublikMagazin' />
        <meta name='twitter:creator' content='@RepublikMagazin' />
      </Head>
      <NarrowContainer>
        <div {...styles.whiteOnBlack}>
          <div {...styles.logoContainer}>
            <Logo fill='#fff' />
          </div>

          <div {...styles.message}>
            Die alte Crowdfunding-Seite, die Abstimmung und das «Wer sind
            Sie?»-Update sind zur Zeit nicht verfügbar.
            <br />
            <br />
            Die Crowdfunding-Seite und die Abstimmung sind auf archive.org
            verfügbar:
            <br />
            <a href='https://web.archive.org/web/20170722203607/https://www.republik.ch/crowdfunding'>
              Crowdfunding
            </a>
            <br />
            <a href='https://web.archive.org/web/20170708151956/https://www.republik.ch/vote'>
              Abstimmung
            </a>
          </div>
        </div>
      </NarrowContainer>
    </div>
  )
}

export default withDefaultSSR(withRouter(Page))
